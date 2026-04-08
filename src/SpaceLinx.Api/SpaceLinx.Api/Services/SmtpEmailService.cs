using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class SmtpEmailService : ISmtpEmailService
{
    private readonly SpaceLinxContext _context;
    private readonly EmailOptions _emailOptions;
    private readonly SmtpOptions _smtpOptions;
    private readonly IBackgroundTaskQueue _backgroundTaskQueue;
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;

    public SmtpEmailService(
        SpaceLinxContext context,
        IOptions<EmailOptions> emailOptions,
        IOptions<SmtpOptions> smtpOptions,
        IBackgroundTaskQueue backgroundTaskQueue,
        ILogger<SmtpEmailService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _emailOptions = emailOptions.Value;
        _smtpOptions = smtpOptions.Value;
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
        var emailLog = new EmailLog
        {
            TemplateCode = templateCode ?? "DIRECT",
            EntityType = entityType,
            EntityId = entityId,
            RecipientEmail = toEmail,
            Subject = subject,
            Body = body,
            Status = EmailStatus.Pending,
            IsActive = true,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow
        };

        await _context.EmailLogs.AddAsync(emailLog, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (!_emailOptions.Enabled)
        {
            _logger.LogInformation("Email sending disabled. Email logged but not sent: {Subject} to {To}",
                subject, toEmail);
            emailLog.Status = EmailStatus.Sent;
            emailLog.SentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return new EmailSendResult(true, emailLog.Id, "Email sending disabled - logged only");
        }

        try
        {
            using var smtpClient = CreateSmtpClient();
            using var mailMessage = CreateMailMessage(toEmail, subject, body, isHtml);

            await smtpClient.SendMailAsync(mailMessage, cancellationToken);

            emailLog.Status = EmailStatus.Sent;
            emailLog.SentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email sent successfully via SMTP: {Subject} to {To}", subject, toEmail);
            return new EmailSendResult(true, emailLog.Id, null);
        }
        catch (Exception ex)
        {
            emailLog.Status = EmailStatus.Failed;
            emailLog.ErrorMessage = $"SMTP: {ex.Message}";
            emailLog.RetryCount++;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogError(ex, "Failed to send email via SMTP: {Subject} to {To}", subject, toEmail);
            return new EmailSendResult(false, emailLog.Id, ex.Message);
        }
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
            var emailService = scope.ServiceProvider.GetRequiredService<ISmtpEmailService>();
            await emailService.SendEmailAsync(
                toEmail, subject, body, isHtml,
                templateCode, entityType, entityId, cancellationToken);
        });
    }

    private SmtpClient CreateSmtpClient()
    {
        var client = new SmtpClient(_smtpOptions.Host, _smtpOptions.Port)
        {
            EnableSsl = _smtpOptions.EnableSsl,
            Credentials = new NetworkCredential(_smtpOptions.Username, _smtpOptions.Password),
            Timeout = _smtpOptions.TimeoutSeconds * 1000
        };
        return client;
    }

    private MailMessage CreateMailMessage(string toEmail, string subject, string body, bool isHtml)
    {
        // Use EmailOptions for from address, fallback to SmtpOptions for backwards compatibility
        var fromEmail = !string.IsNullOrEmpty(_emailOptions.FromEmail)
            ? _emailOptions.FromEmail
            : _smtpOptions.FromEmail;
        var fromName = !string.IsNullOrEmpty(_emailOptions.FromName)
            ? _emailOptions.FromName
            : _smtpOptions.FromName;

        var from = new MailAddress(fromEmail, fromName);
        var to = new MailAddress(toEmail);
        var message = new MailMessage(from, to)
        {
            Subject = subject,
            Body = body,
            IsBodyHtml = isHtml
        };
        return message;
    }
}
