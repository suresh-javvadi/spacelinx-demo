namespace SpaceLinx.Api.Interfaces;

public interface IOffice365UserSyncService
{
    /// <summary>
    /// Syncs users from Office 365 (Azure AD) to SpaceLinx.
    /// Creates new users with the default role; skips existing users.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for graceful shutdown.</param>
    /// <returns>Result summary with users processed and any errors.</returns>
    Task<Office365UserSyncResult> SyncUsersAsync(CancellationToken cancellationToken = default);
}

public record Office365UserSyncResult(
    int TotalUsersFromO365,
    int UsersCreated,
    int UsersSkipped,
    int FailureCount,
    TimeSpan Duration,
    List<string> FailedEmails);
