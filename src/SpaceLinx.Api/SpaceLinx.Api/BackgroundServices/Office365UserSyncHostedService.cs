using Cronos;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;

namespace SpaceLinx.Api.BackgroundServices;

public class Office365UserSyncHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<Office365UserSyncHostedService> _logger;
    private readonly Office365UserSyncOptions _options;
    private readonly CronExpression? _cronExpression;

    public Office365UserSyncHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<Office365UserSyncHostedService> logger,
        IOptions<Office365UserSyncOptions> options)
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
            _logger.LogInformation("Office 365 User Sync service is disabled");
            return;
        }

        if (_cronExpression == null)
        {
            _logger.LogError("Office 365 User Sync service cannot start due to invalid cron expression");
            return;
        }

        _logger.LogInformation(
            "Office 365 User Sync service started with schedule: {CronExpression}",
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
                            "Next Office 365 user sync scheduled for {NextRun} UTC (in {Delay})",
                            nextOccurrence.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                            delay);

                        await Task.Delay(delay, stoppingToken);
                    }

                    if (!stoppingToken.IsCancellationRequested)
                    {
                        await ExecuteUserSyncAsync(stoppingToken);
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
                _logger.LogError(ex, "Error in Office 365 user sync scheduling loop");
                // Wait before retrying to avoid tight error loops
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("Office 365 User Sync service is stopping");
    }

    private async Task ExecuteUserSyncAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Executing Office 365 user sync");

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var syncService = scope.ServiceProvider
                .GetRequiredService<IOffice365UserSyncService>();

            var result = await syncService.SyncUsersAsync(cancellationToken);

            if (result.FailureCount > 0)
            {
                _logger.LogWarning(
                    "Office 365 user sync completed with {FailureCount} failures. Failed emails: {FailedEmails}",
                    result.FailureCount,
                    string.Join(", ", result.FailedEmails.Take(10)));
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute Office 365 user sync");
        }
    }
}
