namespace SpaceLinx.Api.Interfaces;

public interface IBomCacheRefreshService
{
    /// <summary>
    /// Refreshes the BOM cache for all parts that have BOMs.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for graceful shutdown.</param>
    /// <returns>Result summary with parts processed and any errors.</returns>
    Task<BomCacheRefreshResult> RefreshAllBomCachesAsync(CancellationToken cancellationToken = default);
}

public record BomCacheRefreshResult(
    int TotalPartsProcessed,
    int SuccessCount,
    int FailureCount,
    TimeSpan Duration,
    List<Guid> FailedPartIds);
