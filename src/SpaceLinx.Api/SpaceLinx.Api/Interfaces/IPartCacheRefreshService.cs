namespace SpaceLinx.Api.Interfaces;

public interface IPartCacheRefreshService
{
    /// <summary>
    /// Refreshes the unique parts cache.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for graceful shutdown.</param>
    /// <returns>Result summary with refresh status.</returns>
    Task<PartCacheRefreshResult> RefreshUniquePartsCacheAsync(CancellationToken cancellationToken = default);
}

public record PartCacheRefreshResult(
    int PartsCount,
    bool Success,
    TimeSpan Duration,
    string? ErrorMessage = null);
