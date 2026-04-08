using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using System.Diagnostics;

namespace SpaceLinx.Api.Services;

public class BomCacheRefreshService : IBomCacheRefreshService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BomCacheRefreshService> _logger;
    private readonly BomCacheRefreshOptions _options;
    private const string BomCacheKeyPrefix = "bom:hierarchy:";

    public BomCacheRefreshService(
        IServiceScopeFactory scopeFactory,
        ILogger<BomCacheRefreshService> logger,
        IOptions<BomCacheRefreshOptions> options)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<BomCacheRefreshResult> RefreshAllBomCachesAsync(
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var failedPartIds = new List<Guid>();
        int successCount = 0;
        int totalParts = 0;

        _logger.LogInformation("Starting BOM cache refresh job");

        try
        {
            // Get all part IDs with BOMs in a separate scope
            List<Guid> partIds;
            using (var scope = _scopeFactory.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<SpaceLinxContext>();
                partIds = await dbContext.Parts
                    .AsNoTracking()
                    .Where(p => p.HasBom && p.DeletedBy == null && p.ItemType == null && p.Id.HasValue)
                    .Select(p => p.Id!.Value)
                    .ToListAsync(cancellationToken);
            }

            totalParts = partIds.Count;
            _logger.LogInformation("Found {Count} parts with BOMs to refresh", totalParts);

            if (totalParts == 0)
            {
                stopwatch.Stop();
                return new BomCacheRefreshResult(0, 0, 0, stopwatch.Elapsed, new List<Guid>());
            }

            // Process in batches
            var batches = partIds
                .Select((id, index) => new { id, index })
                .GroupBy(x => x.index / _options.BatchSize)
                .Select(g => g.Select(x => x.id).ToList())
                .ToList();

            int batchNumber = 0;
            foreach (var batch in batches)
            {
                if (cancellationToken.IsCancellationRequested)
                {
                    _logger.LogWarning("BOM cache refresh cancelled after {Processed} parts",
                        successCount + failedPartIds.Count);
                    break;
                }

                batchNumber++;
                _logger.LogDebug("Processing batch {BatchNumber}/{TotalBatches}",
                    batchNumber, batches.Count);

                // Process batch with limited concurrency
                using var semaphore = new SemaphoreSlim(_options.MaxConcurrency);
                var tasks = batch.Select(async partId =>
                {
                    await semaphore.WaitAsync(cancellationToken);
                    try
                    {
                        await RefreshSingleBomCacheAsync(partId, cancellationToken);
                        Interlocked.Increment(ref successCount);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to refresh BOM cache for part {PartId}", partId);
                        lock (failedPartIds) { failedPartIds.Add(partId); }
                    }
                    finally
                    {
                        semaphore.Release();
                    }
                });

                await System.Threading.Tasks.Task.WhenAll(tasks);

                // Throttle between batches
                if (batchNumber < batches.Count && _options.DelayBetweenBatchesMs > 0)
                {
                    await System.Threading.Tasks.Task.Delay(_options.DelayBetweenBatchesMs, cancellationToken);
                }
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("BOM cache refresh was cancelled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during BOM cache refresh");
        }

        stopwatch.Stop();
        var result = new BomCacheRefreshResult(
            totalParts,
            successCount,
            failedPartIds.Count,
            stopwatch.Elapsed,
            failedPartIds);

        _logger.LogInformation(
            "BOM cache refresh completed. Total: {Total}, Success: {Success}, Failed: {Failed}, Duration: {Duration}",
            result.TotalPartsProcessed,
            result.SuccessCount,
            result.FailureCount,
            result.Duration);

        return result;
    }

    private async System.Threading.Tasks.Task RefreshSingleBomCacheAsync(Guid partId, CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var cache = scope.ServiceProvider.GetRequiredService<IDistributedCache>();
        var bomService = scope.ServiceProvider.GetRequiredService<IBomService>();

        // Clear existing cache first for a fresh refresh
        var cacheKey = $"{BomCacheKeyPrefix}{partId}";
        await cache.RemoveAsync(cacheKey, cancellationToken);

        // Rebuild the cache by calling GetFullBomHierarchyAsync
        await bomService.GetFullBomHierarchyAsync(partId);
    }
}
