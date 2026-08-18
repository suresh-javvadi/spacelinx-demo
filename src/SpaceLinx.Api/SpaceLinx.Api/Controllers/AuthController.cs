using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Security;
using SpaceLinx.Api.Security.LocalAuth;
using SpaceLinx.Model;
using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Api.Controllers;

/// <summary>
/// Sign-in endpoints for password authentication, plus a public description of which
/// sign-in methods this deployment offers.
///
/// Azure AD sign-in does not pass through here — MSAL talks to Microsoft directly and
/// the resulting token is validated by the "AzureAd" scheme.
/// </summary>
[Route("api/auth")]
[ApiController]
public class AuthController(
    ILocalAuthService _authService,
    IOptions<AuthOptions> _authOptions,
    IConfiguration _configuration) : ControllerBase
{
    private readonly AuthOptions _options = _authOptions.Value;

    /// <summary>
    /// Tells the frontend which sign-in options to render, and the Microsoft settings to
    /// use. Served at runtime so a single frontend build works for every deployment.
    /// </summary>
    [HttpGet("config")]
    [AllowAnonymous]
    public IActionResult GetConfig()
    {
        var tenantId = _configuration["AzureAd:TenantId"];
        var authority = _configuration["AzureAd:Authority"]
            ?? (string.IsNullOrWhiteSpace(tenantId)
                ? "https://login.microsoftonline.com/common"
                : $"https://login.microsoftonline.com/{tenantId}");

        return Ok(new
        {
            // Demo mode overrides the other two: the frontend skips sign-in entirely.
            demoEnabled = _options.Demo.Enabled,
            microsoftEnabled = _options.Microsoft.Enabled,
            passwordEnabled = _options.Password.Enabled,
            // Only meaningful when Microsoft sign-in is on. These are public
            // identifiers, not secrets — the client secret is never exposed.
            microsoft = _options.Microsoft.Enabled
                ? new
                {
                    clientId = _configuration["AzureAd:ClientId"],
                    authority
                }
                : null,
            minPasswordLength = _options.Password.MinPasswordLength
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        if (!_options.Password.Enabled)
        {
            return NotFound();
        }

        var result = await _authService.LoginAsync(request.Email, request.Password, ct);

        if (!result.Succeeded)
        {
            return Unauthorized(new { error = result.Error });
        }

        return Ok(new
        {
            token = result.Token,
            expiresAt = result.ExpiresAtUtc,
            mustChangePassword = result.MustChangePassword
        });
    }

    [HttpPost("change-password")]
    [SpaceLinxAuthroize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request, CancellationToken ct)
    {
        if (!_options.Password.Enabled)
        {
            return NotFound();
        }

        var email = GetSignedInEmail();
        if (string.IsNullOrEmpty(email))
        {
            return Unauthorized();
        }

        var changed = await _authService.ChangePasswordAsync(email, request.CurrentPassword, request.NewPassword, ct);

        if (!changed)
        {
            return BadRequest(new
            {
                error = $"Current password is incorrect, or the new password is shorter than {_options.Password.MinPasswordLength} characters."
            });
        }

        return Ok(new { message = "Password changed." });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request, CancellationToken ct)
    {
        if (!_options.Password.Enabled)
        {
            return NotFound();
        }

        await _authService.RequestPasswordResetAsync(request.Email, ct);

        // Always the same response, whether or not the address exists.
        return Ok(new { message = "If that email address has an account, a reset link has been sent." });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        if (!_options.Password.Enabled)
        {
            return NotFound();
        }

        var reset = await _authService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword, ct);

        if (!reset)
        {
            return BadRequest(new { error = "This reset link is invalid or has expired. Please request a new one." });
        }

        return Ok(new { message = "Password has been reset. You can now sign in." });
    }

    /// <summary>
    /// Sets another user's password. Super Admin only — used when creating accounts and
    /// when a user cannot receive the reset email.
    /// </summary>
    [HttpPost("admin/set-password")]
    [SpaceLinxAuthroize]
    public async Task<IActionResult> SetPassword([FromBody] SetPasswordRequest request, CancellationToken ct)
    {
        if (!_options.Password.Enabled)
        {
            return NotFound();
        }

        var adminEmail = GetSignedInEmail();
        if (string.IsNullOrEmpty(adminEmail))
        {
            return Unauthorized();
        }

        var outcome = await _authService.SetPasswordAsync(
            adminEmail, request.Email, request.NewPassword, request.MustChangePassword, ct);

        return outcome switch
        {
            SetPasswordOutcome.Success => Ok(new { message = "Password set." }),
            SetPasswordOutcome.NotAuthorised => Forbid(),
            SetPasswordOutcome.UserNotFound => NotFound(new { error = "No such user." }),
            SetPasswordOutcome.PasswordTooShort => BadRequest(new
            {
                error = $"Password must be at least {_options.Password.MinPasswordLength} characters."
            }),
            _ => StatusCode(500)
        };
    }

    /// <summary>
    /// Resolves the signed-in user's email the same way <see cref="BaseController"/> does,
    /// so it works for both Azure AD and SpaceLinx-issued tokens.
    /// </summary>
    private string? GetSignedInEmail()
    {
        var email = User.Identity?.Name;
        email ??= User.Claims.FirstOrDefault(c =>
            c.Type == SpaceLinxConstants.PrefUserName || c.Type == SpaceLinxConstants.EmailClaim)?.Value;

        return email?.ToLowerInvariant();
    }
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class SetPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>Require the user to choose their own password at next sign-in.</summary>
    public bool MustChangePassword { get; set; } = true;
}

public class ResetPasswordRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;
}
