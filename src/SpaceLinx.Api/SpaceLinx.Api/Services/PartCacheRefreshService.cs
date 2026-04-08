using SpaceLinx.Api.Interfaces;
using System.Diagnostics;

namespace SpaceLinx.Api.Services;

public class PartCacheRefreshService : IPartCacheRefreshService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PartCacheRefreshService> _logger;

    public PartCacheRefreshService(
        IServiceScopeFactory scopeFactory,
        ILogger<PartCacheRefreshService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task<PartCacheRefreshResult> RefreshUniquePartsCacheAsync(
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        _logger.LogInformation("Starting unique parts cache refresh job");

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var partCacheService = scope.ServiceProvider.GetRequiredService<IPartCacheService>();

            // Invalidate existing cache first
            await partCacheService.InvalidateUniquePartsCacheAsync();

            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("Unique parts cache refresh was cancelled");
                stopwatch.Stop();
                return new PartCacheRefreshResult(0, false, stopwatch.Elapsed, "Cancelled");
            }

            // Rebuild the cache by fetching all unique parts
            var parts = await partCacheService.GetUniquePartsWithLatestVersionAsync();

            stopwatch.Stop();

            _logger.LogInformation(
                "Unique parts cache refresh completed. Parts cached: {Count}, Duration: {Duration}",
                parts.Count,
                stopwatch.Elapsed);

            return new PartCacheRefreshResult(parts.Count, true, stopwatch.Elapsed);
        }
        catch (OperationCanceledException)
        {
            stopwatch.Stop();
            _logger.LogWarning("Unique parts cache refresh was cancelled");
            return new PartCacheRefreshResult(0, false, stopwatch.Elapsed, "Cancelled");
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            _logger.LogError(ex, "Unexpected error during unique parts cache refresh");
            return new PartCacheRefreshResult(0, false, stopwatch.Elapsed, ex.Message);
        }
    }
}
