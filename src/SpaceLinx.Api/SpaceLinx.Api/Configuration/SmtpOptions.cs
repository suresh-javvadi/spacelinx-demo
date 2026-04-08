namespace SpaceLinx.Api.Configuration;

public class SmtpOptions
{
    public const string SectionName = "Smtp";

    /// <summary>
    /// Enable or disable email sending. When disabled, emails are logged but not sent.
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// SMTP server host (e.g., smtp.office365.com)
    /// </summary>
    public string Host { get; set; } = "smtp.office365.com";

    /// <summary>
    /// SMTP server port (typically 587 for TLS)
    /// </summary>
    public int Port { get; set; } = 587;

    /// <summary>
    /// Enable SSL/TLS
    /// </summary>
    public bool EnableSsl { get; set; } = true;

    /// <summary>
    /// SMTP authentication username (email address for Office365)
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// SMTP authentication password or app password
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// From email address
    /// </summary>
    public string FromEmail { get; set; } = string.Empty;

    /// <summary>
    /// From display name
    /// </summary>
    public string FromName { get; set; } = "SpaceLinx System";

    /// <summary>
    /// Maximum retry attempts for failed emails
    /// </summary>
    public int MaxRetryAttempts { get; set; } = 3;

    /// <summary>
    /// Timeout in seconds for SMTP operations
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;
}
