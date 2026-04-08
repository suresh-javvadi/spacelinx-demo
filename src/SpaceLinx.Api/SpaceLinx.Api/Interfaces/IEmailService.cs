namespace SpaceLinx.Api.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Send an email synchronously and log the result.
    /// </summary>
    Task<EmailSendResult> SendEmailAsync(
        string toEmail,
        string subject,
        string body,
        bool isHtml = true,
        string? templateCode = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Queue an email for background sending.
    /// </summary>
    Task QueueEmailAsync(
        string toEmail,
        string subject,
        string body,
        bool isHtml = true,
        string? templateCode = null,
        string? entityType = null,
        Guid? entityId = null);
}

/// <summary>
/// Microsoft Graph API email service
/// </summary>
public interface IGraphEmailService : IEmailService { }

/// <summary>
/// SMTP email service (legacy, used as fallback)
/// </summary>
public interface ISmtpEmailService : IEmailService { }

public record EmailSendResult(
    bool Success,
    Guid? EmailLogId,
    string? ErrorMessage);
