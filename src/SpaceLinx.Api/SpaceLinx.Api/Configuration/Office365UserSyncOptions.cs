namespace SpaceLinx.Api.Configuration;

public class Office365UserSyncOptions
{
    public const string SectionName = "Office365UserSync";

    /// <summary>
    /// Enable or disable the Office 365 user sync service.
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Cron expression for scheduling. Default: "0 2 * * *" (2:00 AM daily).
    /// Format: minute hour day-of-month month day-of-week
    /// Examples:
    /// - "0 0 * * *" = Midnight daily
    /// - "0 2 * * *" = 2:00 AM daily
    /// - "*/2 * * * *" = Every 2 minutes (for testing)
    /// </summary>
    public string CronExpression { get; set; } = "0 2 * * *";

    /// <summary>
    /// Default role name to assign to new users.
    /// </summary>
    public string DefaultRoleName { get; set; } = "Viewer";

    /// <summary>
    /// Application name for role lookup.
    /// </summary>
    public string DefaultAppName { get; set; } = "SPACELINX";
}
