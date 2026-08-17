using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using System.Security.Cryptography;
using System.Text;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Security.LocalAuth;

public interface ILocalAuthService
{
    Task<LoginResult> LoginAsync(string email, string password, CancellationToken ct = default);

    Task<bool> ChangePasswordAsync(string email, string currentPassword, string newPassword, CancellationToken ct = default);

    Task RequestPasswordResetAsync(string email, CancellationToken ct = default);

    Task<bool> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken ct = default);

    Task<SetPasswordOutcome> SetPasswordAsync(string adminEmail, string targetEmail, string newPassword,
        bool mustChangePassword, CancellationToken ct = default);
}

public enum SetPasswordOutcome
{
    Success,
    NotAuthorised,
    UserNotFound,
    PasswordTooShort
}

public record LoginResult(
    bool Succeeded,
    string? Token = null,
    DateTime? ExpiresAtUtc = null,
    bool MustChangePassword = false,
    string? Error = null);

/// <summary>
/// Email + password sign-in against <c>application."user"</c>.
///
/// Only active, non-deleted users that have a password set can sign in this way;
/// Azure-AD-only users have a NULL <see cref="User.PasswordHash"/> and simply fail here.
/// </summary>
public class LocalAuthService(
    SpaceLinxContext _context,
    ILocalTokenService _tokenService,
    IEmailService _emailService,
    IOptions<AuthOptions> _authOptions,
    IConfiguration _configuration,
    ILogger<LocalAuthService> _logger) : ILocalAuthService
{
    private readonly PasswordAuthOptions _options = _authOptions.Value.Password;

    /// <summary>
    /// Deliberately vague: the same message is returned for "no such user", "wrong
    /// password" and "no password set", so the endpoint cannot be used to discover
    /// which email addresses exist.
    /// </summary>
    private const string InvalidCredentials = "Invalid email or password.";

    public async Task<LoginResult> LoginAsync(string email, string password, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return new LoginResult(false, Error: InvalidCredentials);
        }

        var normalised = email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalised && u.DeletedAt == null, ct);

        if (user is null)
        {
            // Spend roughly the same time as a real verification so response timing
            // does not reveal whether the account exists.
            PasswordHasher.Verify(password, PasswordHasher.Hash("timing-equaliser"));
            return new LoginResult(false, Error: InvalidCredentials);
        }

        if (user.LockoutUntil is { } lockedUntil && lockedUntil > DateTime.UtcNow)
        {
            var minutes = Math.Max(1, (int)Math.Ceiling((lockedUntil - DateTime.UtcNow).TotalMinutes));
            return new LoginResult(false, Error: $"Account temporarily locked. Try again in {minutes} minute(s).");
        }

        if (!user.IsActive || !PasswordHasher.Verify(password, user.PasswordHash))
        {
            await RecordFailedAttemptAsync(user, ct);
            return new LoginResult(false, Error: InvalidCredentials);
        }

        // Successful sign-in — clear any failure state.
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;

        // Opportunistically upgrade hashes created with an older work factor.
        if (PasswordHasher.NeedsRehash(user.PasswordHash))
        {
            user.PasswordHash = PasswordHasher.Hash(password);
            user.PasswordUpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(ct);

        var (token, expiresAt) = _tokenService.CreateToken(user);

        _logger.LogInformation("Password sign-in succeeded for {Email}", user.Email);

        return new LoginResult(true, token, expiresAt, user.MustChangePassword);
    }

    public async Task<bool> ChangePasswordAsync(string email, string currentPassword, string newPassword, CancellationToken ct = default)
    {
        if (!IsAcceptablePassword(newPassword))
        {
            return false;
        }

        var normalised = email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalised && u.DeletedAt == null, ct);

        if (user is null || !PasswordHasher.Verify(currentPassword, user.PasswordHash))
        {
            return false;
        }

        user.PasswordHash = PasswordHasher.Hash(newPassword);
        user.PasswordUpdatedAt = DateTime.UtcNow;
        user.MustChangePassword = false;
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;

        // A password change invalidates any outstanding reset link.
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;

        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Password changed for {Email}", user.Email);
        return true;
    }

    public async Task RequestPasswordResetAsync(string email, CancellationToken ct = default)
    {
        var normalised = email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalised && u.DeletedAt == null && u.IsActive, ct);

        // Unknown address: do nothing, but the caller still gets a success response
        // so this endpoint cannot enumerate accounts.
        if (user is null)
        {
            _logger.LogInformation("Password reset requested for unknown address {Email}", normalised);
            return;
        }

        // Raw token goes in the email; only its hash is stored, so a database leak
        // does not hand over working reset links.
        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-").Replace("/", "_").TrimEnd('=');

        user.PasswordResetTokenHash = HashToken(rawToken);
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(_options.ResetTokenLifetimeMinutes);

        await _context.SaveChangesAsync(ct);

        var baseUrl = (_configuration["Email:FrontendBaseUrl"] ?? string.Empty).TrimEnd('/');
        var link = $"{baseUrl}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={rawToken}";

        var body = $"""
            <p>Hello {user.FirstName},</p>
            <p>A password reset was requested for your SpaceLinx account.
            Click the link below to choose a new password. It expires in
            {_options.ResetTokenLifetimeMinutes} minutes.</p>
            <p><a href="{link}">Reset your password</a></p>
            <p>If you did not request this, you can ignore this email — your password will not change.</p>
            """;

        await _emailService.QueueEmailAsync(user.Email, "Reset your SpaceLinx password", body);
    }

    public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token) || !IsAcceptablePassword(newPassword))
        {
            return false;
        }

        var normalised = email.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalised && u.DeletedAt == null, ct);

        if (user?.PasswordResetTokenHash is null ||
            user.PasswordResetTokenExpiresAt is null ||
            user.PasswordResetTokenExpiresAt <= DateTime.UtcNow)
        {
            return false;
        }

        var presented = Encoding.UTF8.GetBytes(HashToken(token));
        var stored = Encoding.UTF8.GetBytes(user.PasswordResetTokenHash);

        if (!CryptographicOperations.FixedTimeEquals(presented, stored))
        {
            return false;
        }

        user.PasswordHash = PasswordHasher.Hash(newPassword);
        user.PasswordUpdatedAt = DateTime.UtcNow;
        user.MustChangePassword = false;
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;

        // Single use.
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;

        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Password reset completed for {Email}", user.Email);
        return true;
    }

    /// <summary>
    /// Lets a Super Admin set another user's password — used to hand out the first
    /// password when an account is created, and to help someone who cannot receive
    /// the reset email. The issuing admin never learns the user's previous password.
    /// </summary>
    public async Task<SetPasswordOutcome> SetPasswordAsync(string adminEmail, string targetEmail,
        string newPassword, bool mustChangePassword, CancellationToken ct = default)
    {
        if (!await IsSuperAdminAsync(adminEmail, ct))
        {
            _logger.LogWarning("Rejected set-password by non-admin {Email}", adminEmail);
            return SetPasswordOutcome.NotAuthorised;
        }

        if (!IsAcceptablePassword(newPassword))
        {
            return SetPasswordOutcome.PasswordTooShort;
        }

        var normalised = targetEmail.Trim().ToLowerInvariant();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalised && u.DeletedAt == null, ct);

        if (user is null)
        {
            return SetPasswordOutcome.UserNotFound;
        }

        user.PasswordHash = PasswordHasher.Hash(newPassword);
        user.PasswordUpdatedAt = DateTime.UtcNow;
        user.MustChangePassword = mustChangePassword;
        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;

        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("{Admin} set the password for {Email}", adminEmail, user.Email);
        return SetPasswordOutcome.Success;
    }

    private async Task<bool> IsSuperAdminAsync(string email, CancellationToken ct)
    {
        var superAdminRole = _configuration["Authorization:SuperAdminRoleName"] ?? "Super Admin";
        var normalised = email.Trim().ToLowerInvariant();

        return await _context.UserRoles.AnyAsync(ur =>
            ur.DeletedAt == null &&
            ur.User.DeletedAt == null &&
            ur.User.IsActive &&
            ur.User.Email.ToLower() == normalised &&
            ur.Role.RoleName == superAdminRole, ct);
    }

    private async Task RecordFailedAttemptAsync(User user, CancellationToken ct)
    {
        user.FailedLoginAttempts++;

        if (user.FailedLoginAttempts >= _options.MaxFailedAttempts)
        {
            user.LockoutUntil = DateTime.UtcNow.AddMinutes(_options.LockoutMinutes);
            user.FailedLoginAttempts = 0;

            _logger.LogWarning(
                "Locked {Email} for {Minutes} minutes after {Attempts} failed sign-in attempts",
                user.Email, _options.LockoutMinutes, _options.MaxFailedAttempts);
        }

        await _context.SaveChangesAsync(ct);
    }

    private bool IsAcceptablePassword(string password) =>
        !string.IsNullOrWhiteSpace(password) && password.Length >= _options.MinPasswordLength;

    private static string HashToken(string token) =>
        Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
