using Cronos;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;

namespace SpaceLinx.Api.BackgroundServices;

public class BomCacheRefreshHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BomCacheRefreshHostedService> _logger;
    private readonly BomCacheRefreshOptions _options;
    private readonly CronExpression? _cronExpression;

    public BomCacheRefreshHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<BomCacheRefreshHostedService> logger,
        IOptions<BomCacheRefreshOptions> options)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _options = options.Value;

        // Parse cron expression (5-field format: minute, hour, day of month, month, day of week)
        try
        {
            _cronExpression = CronExpression.Parse(_options.CronExpression);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Invalid cron expression: {CronExpression}", _options.CronExpression);
            _cronExpression = null;
        }
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.Enabled)
        {
            _logger.LogInformation("BOM Cache Refresh service is disabled");
            return;
        }

        if (_cronExpression == null)
        {
            _logger.LogError("BOM Cache Refresh service cannot start due to invalid cron expression");
            return;
        }

        _logger.LogInformation(
            "BOM Cache Refresh service started with schedule: {CronExpression}",
            _options.CronExpression);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var nextOccurrence = _cronExpression.GetNextOccurrence(
                    DateTimeOffset.UtcNow,
                    TimeZoneInfo.Utc);

                if (nextOccurrence.HasValue)
                {
                    var delay = nextOccurrence.Value - DateTimeOffset.UtcNow;

                    if (delay > TimeSpan.Zero)
                    {
                        _logger.LogInformation(
                            "Next BOM cache refresh scheduled for {NextRun} UTC (in {Delay})",
                            nextOccurrence.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                            delay);

                        await Task.Delay(delay, stoppingToken);
                    }

                    if (!stoppingToken.IsCancellationRequested)
                    {
                        await ExecuteBomCacheRefreshAsync(stoppingToken);
                    }
                }
                else
                {
                    _logger.LogWarning("Could not determine next occurrence for cron expression");
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Graceful shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in BOM cache refresh scheduling loop");
                // Wait before retrying to avoid tight error loops
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("BOM Cache Refresh service is stopping");
    }

    private async Task ExecuteBomCacheRefreshAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Executing scheduled BOM cache refresh");

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var refreshService = scope.ServiceProvider
                .GetRequiredService<IBomCacheRefreshService>();

            var result = await refreshService.RefreshAllBomCachesAsync(cancellationToken);

            if (result.FailureCount > 0)
            {
                _logger.LogWarning(
                    "BOM cache refresh completed with {FailureCount} failures. Failed part IDs: {FailedIds}",
                    result.FailureCount,
                    string.Join(", ", result.FailedPartIds.Take(10)));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute BOM cache refresh");
        }
    }
}
