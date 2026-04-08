namespace SpaceLinx.Api.Configuration;

public class PartCacheRefreshOptions
{
    public const string SectionName = "PartCacheRefresh";

    /// <summary>
    /// Enable or disable the Part cache refresh service.
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Cron expression for scheduling. Default: "0 0 * * *" (midnight daily).
    /// Format: minute hour day-of-month month day-of-week
    /// Examples:
    /// - "0 0 * * *" = Midnight daily
    /// - "0 2 * * *" = 2:00 AM daily
    /// - "0 0 * * 0" = Midnight on Sundays
    /// - "0 */6 * * *" = Every 6 hours
    /// </summary>
    public string CronExpression { get; set; } = "0 0 * * *";
}
