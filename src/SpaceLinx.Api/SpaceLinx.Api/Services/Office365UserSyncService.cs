using Azure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class Office365UserSyncService : IOffice365UserSyncService
{
    private readonly SpaceLinxContext _context;
    private readonly GraphEmailOptions _graphOptions;
    private readonly Office365UserSyncOptions _syncOptions;
    private readonly ILogger<Office365UserSyncService> _logger;
    private readonly GraphServiceClient _graphClient;

    private const string SystemUserName = "System-O365Sync";

    public Office365UserSyncService(
        SpaceLinxContext context,
        IOptions<GraphEmailOptions> graphOptions,
        IOptions<Office365UserSyncOptions> syncOptions,
        ILogger<Office365UserSyncService> logger)
    {
        _context = context;
        _graphOptions = graphOptions.Value;
        _syncOptions = syncOptions.Value;
        _logger = logger;
        _graphClient = CreateGraphClient();
    }

    private GraphServiceClient CreateGraphClient()
    {
        var scopes = new[] { "https://graph.microsoft.com/.default" };

        var clientSecretCredential = new ClientSecretCredential(
            _graphOptions.TenantId,
            _graphOptions.ClientId,
            _graphOptions.ClientSecret);

        return new GraphServiceClient(clientSecretCredential, scopes);
    }

    public async Task<Office365UserSyncResult> SyncUsersAsync(CancellationToken cancellationToken = default)
    {
        var stopwatch = System.Diagnostics.Stopwatch.StartNew();
        var failedEmails = new List<string>();
        var usersCreated = 0;
        var usersSkipped = 0;

        try
        {
            // Fetch all users from Office 365
            var o365Users = await FetchAllO365UsersAsync(cancellationToken);
            _logger.LogInformation("Fetched {Count} users from Office 365", o365Users.Count);

            // Get existing user emails for comparison (case-insensitive)
            var existingEmails = await _context.Users
                .Where(u => u.DeletedBy == null)
                .Select(u => u.Email.ToLower())
                .ToHashSetAsync(cancellationToken);

            // Get the default role for new users
            var defaultRole = await GetDefaultRoleAsync(cancellationToken);
            if (defaultRole == null)
            {
                _logger.LogError(
                    "Cannot sync users: Role '{RoleName}' not found for app '{AppName}'",
                    _syncOptions.DefaultRoleName,
                    _syncOptions.DefaultAppName);

                stopwatch.Stop();
                return new Office365UserSyncResult(
                    o365Users.Count,
                    0,
                    0,
                    o365Users.Count,
                    stopwatch.Elapsed,
                    o365Users.Select(u => GetUserEmail(u) ?? "unknown").ToList());
            }

            // Process each O365 user
            foreach (var o365User in o365Users)
            {
                var email = GetUserEmail(o365User);
                if (string.IsNullOrWhiteSpace(email))
                {
                    _logger.LogDebug("Skipping O365 user {Id} - no email address", o365User.Id);
                    usersSkipped++;
                    continue;
                }

                var emailLower = email.ToLowerInvariant();
                if (existingEmails.Contains(emailLower))
                {
                    _logger.LogDebug("Skipping O365 user {Email} - already exists in SpaceLinx", email);
                    usersSkipped++;
                    continue;
                }

                try
                {
                    await CreateUserWithRoleAsync(o365User, email, defaultRole, cancellationToken);
                    existingEmails.Add(emailLower); // Track to avoid duplicates in same batch
                    usersCreated++;
                    _logger.LogDebug("Created user {Email} from O365", email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to create user {Email} from O365", email);
                    failedEmails.Add(email);
                }
            }

            stopwatch.Stop();

            _logger.LogInformation(
                "Office 365 user sync completed: {Created} created, {Skipped} skipped, {Failed} failed in {Duration:F1}s",
                usersCreated,
                usersSkipped,
                failedEmails.Count,
                stopwatch.Elapsed.TotalSeconds);

            return new Office365UserSyncResult(
                o365Users.Count,
                usersCreated,
                usersSkipped,
                failedEmails.Count,
                stopwatch.Elapsed,
                failedEmails);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Office 365 user sync failed");
            throw;
        }
    }

    private async Task<List<Microsoft.Graph.Models.User>> FetchAllO365UsersAsync(CancellationToken cancellationToken)
    {
        var allUsers = new List<Microsoft.Graph.Models.User>();

        var response = await _graphClient.Users.GetAsync(requestConfiguration =>
        {
            requestConfiguration.QueryParameters.Select = new[]
            {
                "id", "mail", "userPrincipalName", "givenName", "surname", "mobilePhone", "businessPhones"
            };
            requestConfiguration.QueryParameters.Top = 999;
        }, cancellationToken);

        if (response?.Value != null)
        {
            allUsers.AddRange(response.Value);
        }

        // Handle pagination
        while (response?.OdataNextLink != null)
        {
            response = await _graphClient.Users
                .WithUrl(response.OdataNextLink)
                .GetAsync(cancellationToken: cancellationToken);

            if (response?.Value != null)
            {
                allUsers.AddRange(response.Value);
            }
        }

        return allUsers;
    }

    private async Task<Role?> GetDefaultRoleAsync(CancellationToken cancellationToken)
    {
        return await _context.Roles
            .Include(r => r.App)
            .Where(r => r.DeletedBy == null &&
                        r.RoleName == _syncOptions.DefaultRoleName &&
                        r.App.AppName == _syncOptions.DefaultAppName &&
                        r.App.DeletedBy == null)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static string? GetUserEmail(Microsoft.Graph.Models.User o365User)
    {
        // Prefer Mail, fall back to UserPrincipalName
        if (!string.IsNullOrWhiteSpace(o365User.Mail))
        {
            return o365User.Mail;
        }

        // UserPrincipalName might be an email or might contain #EXT# for guests
        if (!string.IsNullOrWhiteSpace(o365User.UserPrincipalName) &&
            o365User.UserPrincipalName.Contains('@') &&
            !o365User.UserPrincipalName.Contains("#EXT#"))
        {
            return o365User.UserPrincipalName;
        }

        return null;
    }

    private static string? GetUserPhone(Microsoft.Graph.Models.User o365User)
    {
        // Prefer MobilePhone, fall back to first BusinessPhone
        if (!string.IsNullOrWhiteSpace(o365User.MobilePhone))
        {
            return o365User.MobilePhone;
        }

        if (o365User.BusinessPhones?.Count > 0 &&
            !string.IsNullOrWhiteSpace(o365User.BusinessPhones[0]))
        {
            return o365User.BusinessPhones[0];
        }

        return null;
    }

    private async Task CreateUserWithRoleAsync(
        Microsoft.Graph.Models.User o365User,
        string email,
        Role defaultRole,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var user = new Model.User
        {
            Id = Guid.NewGuid(),
            Email = email.ToLowerInvariant(),
            FirstName = o365User.GivenName ?? email.Split('@')[0],
            LastName = o365User.Surname,
            Phone = GetUserPhone(o365User),
            IsActive = true,
            CreatedBy = SystemUserName,
            CreatedAt = now
        };

        var userRole = new UserRole
        {
            Id = Guid.NewGuid(),
            UserId = user.Id.Value,
            RoleId = defaultRole.Id!.Value,
            IsDefault = true,
            IsActive = true,
            CreatedBy = SystemUserName,
            CreatedAt = now
        };

        await _context.Users.AddAsync(user, cancellationToken);
        await _context.UserRoles.AddAsync(userRole, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
