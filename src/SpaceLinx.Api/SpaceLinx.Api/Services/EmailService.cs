using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

/// <summary>
/// Composite email service that uses Graph API as primary and SMTP as fallback
/// </summary>
public class EmailService : IEmailService
{
    private readonly SpaceLinxContext _context;
    private readonly EmailOptions _emailOptions;
    private readonly IGraphEmailService _graphEmailService;
    private readonly ISmtpEmailService _smtpEmailService;
    private readonly IBackgroundTaskQueue _backgroundTaskQueue;
    private readonly ILogger<EmailService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public EmailService(
        SpaceLinxContext context,
        IOptions<EmailOptions> emailOptions,
        IGraphEmailService graphEmailService,
        ISmtpEmailService smtpEmailService,
        IBackgroundTaskQueue backgroundTaskQueue,
        ILogger<EmailService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _emailOptions = emailOptions.Value;
        _graphEmailService = graphEmailService;
        _smtpEmailService = smtpEmailService;
        _backgroundTaskQueue = backgroundTaskQueue;
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    public async Task<EmailSendResult> SendEmailAsync(
        string toEmail,
        string subject,
        string body,
        bool isHtml = true,
        string? templateCode = null,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default)
    {
        if (!_emailOptions.Enabled)
        {
            return await LogOnlyEmailAsync(toEmail, subject, body, templateCode, entityType, entityId, cancellationToken);
        }

        var useGraph = _emailOptions.Provider.Equals("Graph", StringComparison.OrdinalIgnoreCase);

        if (useGraph)
        {
            var result = await _graphEmailService.SendEmailAsync(
                toEmail, subject, body, isHtml, templateCode, entityType, entityId, cancellationToken);

            if (result.Success)
            {
                return result;
            }

            // Graph failed, try SMTP fallback if enabled
            if (_emailOptions.EnableSmtpFallback)
            {
                _logger.LogWarning("Graph API email failed, attempting SMTP fallback for: {Subject} to {To}",
                    subject, toEmail);

                // Update the existing log entry to show fallback attempt
                if (result.EmailLogId.HasValue)
                {
                    var emailLog = await _context.EmailLogs.FindAsync(new object[] { result.EmailLogId.Value }, cancellationToken);
                    if (emailLog != null)
                    {
                        emailLog.ErrorMessage += " | Attempting SMTP fallback...";
                        await _context.SaveChangesAsync(cancellationToken);
                    }
                }

                var smtpResult = await SendViaSmtpWithExistingLogAsync(
                    result.EmailLogId, toEmail, subject, body, isHtml, cancellationToken);

                return smtpResult;
            }

            return result;
        }
        else
        {
            // SMTP is primary
            return await _smtpEmailService.SendEmailAsync(
                toEmail, subject, body, isHtml, templateCode, entityType, entityId, cancellationToken);
        }
    }

    private async Task<EmailSendResult> SendViaSmtpWithExistingLogAsync(
        Guid? existingLogId,
        string toEmail,
        string subject,
        string body,
        bool isHtml,
        CancellationToken cancellationToken)
    {
        try
        {
            // Use the internal SMTP sending logic without creating a new log
            var smtpResult = await _smtpEmailService.SendEmailAsync(
                toEmail, subject, body, isHtml, "FALLBACK", null, null, cancellationToken);

            // Update the original log entry with the fallback result
            if (existingLogId.HasValue)
            {
                var emailLog = await _context.EmailLogs.FindAsync(new object[] { existingLogId.Value }, cancellationToken);
                if (emailLog != null)
                {
                    if (smtpResult.Success)
                    {
                        emailLog.Status = EmailStatus.Sent;
                        emailLog.SentAt = DateTime.UtcNow;
                        emailLog.ErrorMessage += " | SMTP fallback succeeded";
                    }
                    else
                    {
                        emailLog.ErrorMessage += $" | SMTP fallback also failed: {smtpResult.ErrorMessage}";
                    }
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }

            return new EmailSendResult(smtpResult.Success, existingLogId, smtpResult.ErrorMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMTP fallback failed for: {Subject} to {To}", subject, toEmail);
            return new EmailSendResult(false, existingLogId, $"SMTP fallback failed: {ex.Message}");
        }
    }

    private async Task<EmailSendResult> LogOnlyEmailAsync(
        string toEmail,
        string subject,
        string body,
        string? templateCode,
        string? entityType,
        Guid? entityId,
        CancellationToken cancellationToken)
    {
        var emailLog = new EmailLog
        {
            TemplateCode = templateCode ?? "DIRECT",
            EntityType = entityType,
            EntityId = entityId,
            RecipientEmail = toEmail,
            Subject = subject,
            Body = body,
            Status = EmailStatus.Sent,
            SentAt = DateTime.UtcNow,
            IsActive = true,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow
        };

        await _context.EmailLogs.AddAsync(emailLog, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Email sending disabled. Email logged but not sent: {Subject} to {To}",
            subject, toEmail);

        return new EmailSendResult(true, emailLog.Id, "Email sending disabled - logged only");
    }

    public async Task QueueEmailAsync(
        string toEmail,
        string subject,
        string body,
        bool isHtml = true,
        string? templateCode = null,
        string? entityType = null,
        Guid? entityId = null)
    {
        await _backgroundTaskQueue.QueueBackgroundWorkItemAsync(async cancellationToken =>
        {
            using var scope = _scopeFactory.CreateScope();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
            await emailService.SendEmailAsync(
                toEmail, subject, body, isHtml,
                templateCode, entityType, entityId, cancellationToken);
        });
    }
}
