namespace SpaceLinx.Api.Configuration;

public class EmailOptions
{
    public const string SectionName = "Email";

    /// <summary>
    /// Enable or disable email sending. When disabled, emails are logged but not sent.
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Primary email provider: "Graph" (recommended) or "Smtp"
    /// </summary>
    public string Provider { get; set; } = "Graph";

    /// <summary>
    /// Enable SMTP as fallback when Graph API fails
    /// </summary>
    public bool EnableSmtpFallback { get; set; } = true;

    /// <summary>
    /// From email address (used by both providers)
    /// </summary>
    public string FromEmail { get; set; } = string.Empty;

    /// <summary>
    /// From display name (used by both providers)
    /// </summary>
    public string FromName { get; set; } = "SpaceLinx System";

    /// <summary>
    /// Maximum retry attempts for failed emails
    /// </summary>
    public int MaxRetryAttempts { get; set; } = 3;

    /// <summary>
    /// Frontend base URL for generating direct record links in emails.
    /// Example: https://spacelinx.xdlinx.space
    /// </summary>
    public string FrontendBaseUrl { get; set; } = string.Empty;
}

public class GraphEmailOptions
{
    public const string SectionName = "Email:Graph";

    /// <summary>
    /// Azure AD Tenant ID
    /// </summary>
    public string TenantId { get; set; } = string.Empty;

    /// <summary>
    /// Azure AD Application (Client) ID
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// Azure AD Client Secret
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// User ID or UPN of the sender (mail-enabled user or shared mailbox)
    /// If empty, uses the FromEmail from EmailOptions
    /// </summary>
    public string SendAsUserId { get; set; } = string.Empty;

    /// <summary>
    /// Save sent emails to the Sent Items folder (default: false for app-only auth)
    /// </summary>
    public bool SaveToSentItems { get; set; } = false;
}
