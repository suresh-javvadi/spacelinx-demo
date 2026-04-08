namespace SpaceLinx.Api.Configuration;

public class BomCacheRefreshOptions
{
    public const string SectionName = "BomCacheRefresh";

    /// <summary>
    /// Enable or disable the BOM cache refresh service.
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

    /// <summary>
    /// Number of parts to process per batch.
    /// </summary>
    public int BatchSize { get; set; } = 50;

    /// <summary>
    /// Delay in milliseconds between processing batches (throttling).
    /// </summary>
    public int DelayBetweenBatchesMs { get; set; } = 1000;

    /// <summary>
    /// Maximum number of concurrent BOM refresh operations within a batch.
    /// </summary>
    public int MaxConcurrency { get; set; } = 5;
}
