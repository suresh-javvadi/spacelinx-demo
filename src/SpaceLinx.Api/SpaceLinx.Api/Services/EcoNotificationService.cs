using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class EcoNotificationService : IEcoNotificationService
{
    private readonly SpaceLinxContext _context;
    private readonly IEmailTemplateService _templateService;
    private readonly IEmailService _emailService;
    private readonly IEntityLinkHelper _entityLinkHelper;
    private readonly ILogger<EcoNotificationService> _logger;

    public EcoNotificationService(
        SpaceLinxContext context,
        IEmailTemplateService templateService,
        IEmailService emailService,
        IEntityLinkHelper entityLinkHelper,
        ILogger<EcoNotificationService> logger)
    {
        _context = context;
        _templateService = templateService;
        _emailService = emailService;
        _entityLinkHelper = entityLinkHelper;
        _logger = logger;
    }

    public async Task NotifyEcoSubmittedAsync(Guid ecoId)
    {
        var eco = await GetEcoAsync(ecoId);
        if (eco == null) return;

        var placeholders = BuildPlaceholders(eco, ecoId, "Submitted");
        var recipients = await GetEcoRecipientsAsync(ecoId, eco.Requestor, EmailTemplateCode.EcoSubmitted);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(
                EmailTemplateCode.EcoSubmitted, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    EmailTemplateCode.EcoSubmitted,
                    SpaceLinxEntities.Eco,
                    ecoId);
            }
        }

        _logger.LogInformation("Queued ECO submitted notifications for ECO {EcoId} to {Count} recipients",
            ecoId, recipients.Count);
    }

    public async Task NotifyEcoApprovedAsync(Guid ecoId)
    {
        var eco = await GetEcoAsync(ecoId);
        if (eco == null) return;

        var placeholders = BuildPlaceholders(eco, ecoId, "Approved");
        var recipients = await GetEcoRecipientsAsync(ecoId, eco.Requestor, EmailTemplateCode.EcoApproved);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(
                EmailTemplateCode.EcoApproved, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    EmailTemplateCode.EcoApproved,
                    SpaceLinxEntities.Eco,
                    ecoId);
            }
        }

        _logger.LogInformation("Queued ECO approved notifications for ECO {EcoId} to {Count} recipients",
            ecoId, recipients.Count);
    }

    public async Task NotifyEcoRejectedAsync(Guid ecoId, string rejectorEmail, string? notes)
    {
        var eco = await GetEcoAsync(ecoId);
        if (eco == null) return;

        var placeholders = BuildPlaceholders(eco, ecoId, "Rejected");
        placeholders["RejectorEmail"] = rejectorEmail;
        placeholders["RejectionNotes"] = notes ?? "No notes provided";

        var recipients = await GetEcoRecipientsAsync(ecoId, eco.Requestor, EmailTemplateCode.EcoRejected);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(
                EmailTemplateCode.EcoRejected, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    EmailTemplateCode.EcoRejected,
                    SpaceLinxEntities.Eco,
                    ecoId);
            }
        }

        _logger.LogInformation("Queued ECO rejected notifications for ECO {EcoId} to {Count} recipients",
            ecoId, recipients.Count);
    }

    public async Task NotifyEcoReleasedAsync(Guid ecoId)
    {
        var eco = await GetEcoAsync(ecoId);
        if (eco == null) return;

        var placeholders = BuildPlaceholders(eco, ecoId, "Released");
        var recipients = await GetEcoRecipientsAsync(ecoId, eco.Requestor, EmailTemplateCode.EcoReleased);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(
                EmailTemplateCode.EcoReleased, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    EmailTemplateCode.EcoReleased,
                    SpaceLinxEntities.Eco,
                    ecoId);
            }
        }

        _logger.LogInformation("Queued ECO released notifications for ECO {EcoId} to {Count} recipients",
            ecoId, recipients.Count);
    }

    private async Task<Eco?> GetEcoAsync(Guid ecoId)
    {
        var eco = await _context.Ecos
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == ecoId && e.DeletedBy == null);

        if (eco == null)
        {
            _logger.LogWarning("ECO not found for notification: {EcoId}", ecoId);
        }

        return eco;
    }

    private async Task<List<EmailRecipient>> GetEcoRecipientsAsync(Guid ecoId, string requestorEmail, string? templateCode = null)
    {
        var recipients = new List<EmailRecipient>();

        // Add requestor
        var requestor = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == requestorEmail.ToLower());

        if (requestor != null)
        {
            recipients.Add(new EmailRecipient(
                requestor.Email,
                $"{requestor.FirstName} {requestor.LastName}".Trim()));
        }

        // Add all approvers
        var approvers = await _context.Approvals
            .AsNoTracking()
            .Include(a => a.Approver)
            .Where(a => a.EntityType == SpaceLinxEntities.Eco &&
                       a.EntityId == ecoId &&
                       a.DeletedBy == null &&
                       a.Status != ApprovalStatus.Removed)
            .Select(a => a.Approver)
            .Distinct()
            .ToListAsync();

        foreach (var approver in approvers)
        {
            AddUniqueRecipient(recipients, approver.Email, $"{approver.FirstName} {approver.LastName}".Trim());
        }

        // Get additional notification recipients (per-instance)
        var additionalRecipients = await _context.ApprovalNotificationRecipients
            .AsNoTracking()
            .Include(r => r.RecipientUser)
            .Where(r => r.EntityType == SpaceLinxEntities.Eco &&
                       r.EntityId == ecoId &&
                       r.DeletedBy == null)
            .ToListAsync();

        foreach (var additional in additionalRecipients)
        {
            AddUniqueRecipient(recipients, additional.RecipientUser.Email,
                $"{additional.RecipientUser.FirstName} {additional.RecipientUser.LastName}".Trim());
        }

        // Get global recipients configured for this template
        if (!string.IsNullOrEmpty(templateCode))
        {
            var globalRecipients = await _context.AdditionalRecipientConfigurations
                .AsNoTracking()
                .Where(r => r.TemplateCode.ToUpper() == templateCode.ToUpper() &&
                           r.DeletedBy == null &&
                           r.IsActive == true)
                .ToListAsync();

            foreach (var global in globalRecipients)
            {
                AddUniqueRecipient(recipients, global.Email, global.RecipientName ?? global.Email);
            }
        }

        return recipients;
    }

    private static void AddUniqueRecipient(List<EmailRecipient> recipients, string email, string name)
    {
        if (!recipients.Any(r => r.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
        {
            recipients.Add(new EmailRecipient(email, name));
        }
    }

    private Dictionary<string, string> BuildPlaceholders(Eco eco, Guid ecoId, string action)
    {
        return new Dictionary<string, string>
        {
            ["EcoNumber"] = eco.Number,
            ["EcoName"] = eco.Name,
            ["EcoDescription"] = eco.Description ?? "",
            ["ChangeType"] = eco.ChangeType,
            ["Priority"] = eco.Priority,
            ["ReasonForChange"] = eco.ReasonForChange,
            ["Requestor"] = eco.Requestor,
            ["Status"] = eco.Status,
            ["Action"] = action,
            ["Timestamp"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC"),
            ["RecordLink"] = _entityLinkHelper.GetRecordLink(SpaceLinxEntities.Eco, ecoId)
        };
    }

    private record EmailRecipient(string Email, string Name);
}
