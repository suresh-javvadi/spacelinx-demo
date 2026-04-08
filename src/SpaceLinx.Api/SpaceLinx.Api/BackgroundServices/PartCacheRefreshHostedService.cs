using Cronos;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;

namespace SpaceLinx.Api.BackgroundServices;

public class PartCacheRefreshHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PartCacheRefreshHostedService> _logger;
    private readonly PartCacheRefreshOptions _options;
    private readonly CronExpression? _cronExpression;

    public PartCacheRefreshHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<PartCacheRefreshHostedService> logger,
        IOptions<PartCacheRefreshOptions> options)
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
            _logger.LogInformation("Part Cache Refresh service is disabled");
            return;
        }

        if (_cronExpression == null)
        {
            _logger.LogError("Part Cache Refresh service cannot start due to invalid cron expression");
            return;
        }

        _logger.LogInformation(
            "Part Cache Refresh service started with schedule: {CronExpression}",
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
                            "Next Part cache refresh scheduled for {NextRun} UTC (in {Delay})",
                            nextOccurrence.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                            delay);

                        await Task.Delay(delay, stoppingToken);
                    }

                    if (!stoppingToken.IsCancellationRequested)
                    {
                        await ExecutePartCacheRefreshAsync(stoppingToken);
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
                _logger.LogError(ex, "Error in Part cache refresh scheduling loop");
                // Wait before retrying to avoid tight error loops
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("Part Cache Refresh service is stopping");
    }

    private async Task ExecutePartCacheRefreshAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Executing scheduled Part cache refresh");

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var refreshService = scope.ServiceProvider
                .GetRequiredService<IPartCacheRefreshService>();

            var result = await refreshService.RefreshUniquePartsCacheAsync(cancellationToken);

            if (!result.Success)
            {
                _logger.LogWarning(
                    "Part cache refresh completed with failure. Error: {Error}",
                    result.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute Part cache refresh");
        }
    }
}
