using Azure.Identity;
using Microsoft.Extensions.Options;
using Microsoft.Graph;
using Microsoft.Graph.Models;
using Microsoft.Graph.Users.Item.SendMail;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class GraphEmailService : IGraphEmailService
{
    private readonly SpaceLinxContext _context;
    private readonly EmailOptions _emailOptions;
    private readonly GraphEmailOptions _graphOptions;
    private readonly IBackgroundTaskQueue _backgroundTaskQueue;
    private readonly ILogger<GraphEmailService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly GraphServiceClient _graphClient;

    public GraphEmailService(
        SpaceLinxContext context,
        IOptions<EmailOptions> emailOptions,
        IOptions<GraphEmailOptions> graphOptions,
        IBackgroundTaskQueue backgroundTaskQueue,
        ILogger<GraphEmailService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _context = context;
        _emailOptions = emailOptions.Value;
        _graphOptions = graphOptions.Value;
        _backgroundTaskQueue = backgroundTaskQueue;
        _logger = logger;
        _scopeFactory = scopeFactory;
        _graphClient = CreateGraphClient();
    }

    private GraphServiceClient CreateGraphClient()
    {
        var scopes = new[] { "https://graph.microsoft.com/.default" };

        var clientSecretCredential = new ClientSecretCredential(
            _graphOptions.TenantId,
            _graphOptions.ClientId,
            _graphOptions.ClientSecret);

        return new GraphServiceClient(clientSecretCredential, scopes);
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
            var message = new Message
            {
                Subject = subject,
                Body = new ItemBody
                {
                    ContentType = isHtml ? BodyType.Html : BodyType.Text,
                    Content = body
                },
                ToRecipients = new List<Recipient>
                {
                    new Recipient
                    {
                        EmailAddress = new EmailAddress
                        {
                            Address = toEmail
                        }
                    }
                },
                From = new Recipient
                {
                    EmailAddress = new EmailAddress
                    {
                        Address = _emailOptions.FromEmail,
                        Name = _emailOptions.FromName
                    }
                }
            };

            var senderId = !string.IsNullOrEmpty(_graphOptions.SendAsUserId)
                ? _graphOptions.SendAsUserId
                : _emailOptions.FromEmail;

            var requestBody = new SendMailPostRequestBody
            {
                Message = message,
                SaveToSentItems = _graphOptions.SaveToSentItems
            };

            await _graphClient.Users[senderId].SendMail.PostAsync(requestBody, cancellationToken: cancellationToken);

            emailLog.Status = EmailStatus.Sent;
            emailLog.SentAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email sent successfully via Graph API: {Subject} to {To}", subject, toEmail);
            return new EmailSendResult(true, emailLog.Id, null);
        }
        catch (Exception ex)
        {
            emailLog.Status = EmailStatus.Failed;
            emailLog.ErrorMessage = $"Graph API: {ex.Message}";
            emailLog.RetryCount++;
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogError(ex, "Failed to send email via Graph API: {Subject} to {To}", subject, toEmail);
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
            var emailService = scope.ServiceProvider.GetRequiredService<IGraphEmailService>();
            await emailService.SendEmailAsync(
                toEmail, subject, body, isHtml,
                templateCode, entityType, entityId, cancellationToken);
        });
    }
}
