using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class ApprovalNotificationService : IApprovalNotificationService
{
    private readonly SpaceLinxContext _context;
    private readonly IEmailTemplateService _templateService;
    private readonly IEmailService _emailService;
    private readonly IEntityLinkHelper _entityLinkHelper;
    private readonly ILogger<ApprovalNotificationService> _logger;

    // Template code mapping per entity type
    private static readonly Dictionary<string, EntityTemplates> _templateMap = new()
    {
        [SpaceLinxEntities.Requisition] = new EntityTemplates(
            EmailTemplateCode.RequisitionSubmitted,
            EmailTemplateCode.RequisitionApproved,
            EmailTemplateCode.RequisitionRejected,
            EmailTemplateCode.RequisitionStageApproved),
        [SpaceLinxEntities.PurchaseOrder] = new EntityTemplates(
            EmailTemplateCode.PoSubmitted,
            EmailTemplateCode.PoApproved,
            EmailTemplateCode.PoRejected,
            EmailTemplateCode.PoStageApproved)
    };

    public ApprovalNotificationService(
        SpaceLinxContext context,
        IEmailTemplateService templateService,
        IEmailService emailService,
        IEntityLinkHelper entityLinkHelper,
        ILogger<ApprovalNotificationService> logger)
    {
        _context = context;
        _templateService = templateService;
        _emailService = emailService;
        _entityLinkHelper = entityLinkHelper;
        _logger = logger;
    }

    public async Task NotifySubmittedAsync(string entityType, Guid entityId)
    {
        var templates = GetTemplates(entityType);
        if (templates?.SubmittedCode == null) return;

        var placeholders = await BuildPlaceholdersAsync(entityType, entityId, "Submitted");
        var recipients = await GetRecipientsAsync(entityType, entityId, templates.SubmittedCode);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(templates.SubmittedCode, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    templates.SubmittedCode,
                    entityType,
                    entityId);
            }
        }

        _logger.LogInformation("Queued {EntityType} submitted notifications for {EntityId} to {Count} recipients",
            entityType, entityId, recipients.Count);
    }

    public async Task NotifyStageApprovedAsync(string entityType, Guid entityId, int stageNumber, string approverEmail)
    {
        var templates = GetTemplates(entityType);
        if (templates?.StageApprovedCode == null) return;

        var placeholders = await BuildPlaceholdersAsync(entityType, entityId, "Stage Approved");
        placeholders["StageNumber"] = stageNumber.ToString();
        placeholders["ApproverEmail"] = approverEmail;

        var recipients = await GetRecipientsAsync(entityType, entityId, templates.StageApprovedCode);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(templates.StageApprovedCode, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    templates.StageApprovedCode,
                    entityType,
                    entityId);
            }
        }

        _logger.LogInformation("Queued {EntityType} stage {StageNumber} approved notifications for {EntityId} to {Count} recipients",
            entityType, stageNumber, entityId, recipients.Count);
    }

    public async Task NotifyFullyApprovedAsync(string entityType, Guid entityId)
    {
        var templates = GetTemplates(entityType);
        if (templates?.ApprovedCode == null) return;

        var placeholders = await BuildPlaceholdersAsync(entityType, entityId, "Approved");
        var recipients = await GetRecipientsAsync(entityType, entityId, templates.ApprovedCode);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(templates.ApprovedCode, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    templates.ApprovedCode,
                    entityType,
                    entityId);
            }
        }

        _logger.LogInformation("Queued {EntityType} fully approved notifications for {EntityId} to {Count} recipients",
            entityType, entityId, recipients.Count);
    }

    public async Task NotifyRejectedAsync(string entityType, Guid entityId, string rejectorEmail, string? notes)
    {
        var templates = GetTemplates(entityType);
        if (templates?.RejectedCode == null) return;

        var placeholders = await BuildPlaceholdersAsync(entityType, entityId, "Rejected");
        placeholders["RejectorEmail"] = rejectorEmail;
        placeholders["RejectionNotes"] = notes ?? "No notes provided";

        var recipients = await GetRecipientsAsync(entityType, entityId, templates.RejectedCode);

        foreach (var recipient in recipients)
        {
            placeholders["RecipientName"] = recipient.Name;
            var rendered = await _templateService.RenderTemplateAsync(templates.RejectedCode, placeholders);

            if (rendered != null)
            {
                await _emailService.QueueEmailAsync(
                    recipient.Email,
                    rendered.Subject,
                    rendered.Body,
                    rendered.IsHtml,
                    templates.RejectedCode,
                    entityType,
                    entityId);
            }
        }

        _logger.LogInformation("Queued {EntityType} rejected notifications for {EntityId} to {Count} recipients",
            entityType, entityId, recipients.Count);
    }

    private static EntityTemplates? GetTemplates(string entityType)
    {
        return _templateMap.TryGetValue(entityType, out var templates) ? templates : null;
    }

    private async Task<List<EmailRecipient>> GetRecipientsAsync(string entityType, Guid entityId, string? templateCode = null)
    {
        var recipients = new List<EmailRecipient>();

        // 1. Get owner/requestor based on entity type
        await AddEntityOwnerAsync(entityType, entityId, recipients);

        // 2. Get all approvers
        var approvers = await _context.Approvals
            .AsNoTracking()
            .Include(a => a.Approver)
            .Where(a => a.EntityType == entityType &&
                       a.EntityId == entityId &&
                       a.DeletedBy == null &&
                       a.Status != ApprovalStatus.Removed)
            .Select(a => a.Approver)
            .Distinct()
            .ToListAsync();

        foreach (var approver in approvers)
        {
            AddUniqueRecipient(recipients, approver.Email,
                $"{approver.FirstName} {approver.LastName}".Trim());
        }

        // 3. Get additional notification recipients (per-instance)
        var additionalRecipients = await _context.ApprovalNotificationRecipients
            .AsNoTracking()
            .Include(r => r.RecipientUser)
            .Where(r => r.EntityType == entityType &&
                       r.EntityId == entityId &&
                       r.DeletedBy == null)
            .ToListAsync();

        foreach (var additional in additionalRecipients)
        {
            AddUniqueRecipient(recipients, additional.RecipientUser.Email,
                $"{additional.RecipientUser.FirstName} {additional.RecipientUser.LastName}".Trim());
        }

        // 4. Get global recipients configured for this template
        if (!string.IsNullOrEmpty(templateCode))
        {
            var globalRecipients = await _context.AdditionalRecipientConfigurations
                .AsNoTracking()
                .Where(r => r.TemplateCode.ToUpper() == templateCode.ToUpper() &&
                           r.DeletedBy == null &&
                           r.IsActive)
                .ToListAsync();

            foreach (var global in globalRecipients)
            {
                AddUniqueRecipient(recipients, global.Email, global.RecipientName ?? global.Email);
            }
        }

        return recipients;
    }

    private async Task AddEntityOwnerAsync(string entityType, Guid entityId, List<EmailRecipient> recipients)
    {
        switch (entityType)
        {
            case SpaceLinxEntities.Requisition:
                var requisition = await _context.Requisitions
                    .AsNoTracking()
                    .Include(r => r.RequestedBy)
                    .FirstOrDefaultAsync(r => r.Id == entityId);
                if (requisition?.RequestedBy != null)
                {
                    AddUniqueRecipient(recipients, requisition.RequestedBy.Email,
                        $"{requisition.RequestedBy.FirstName} {requisition.RequestedBy.LastName}".Trim());
                }
                break;

            case SpaceLinxEntities.PurchaseOrder:
                var po = await _context.PurchaseOrders
                    .AsNoTracking()
                    .Include(p => p.Buyer)
                    .FirstOrDefaultAsync(p => p.Id == entityId);
                if (po?.Buyer != null)
                {
                    AddUniqueRecipient(recipients, po.Buyer.Email,
                        $"{po.Buyer.FirstName} {po.Buyer.LastName}".Trim());
                }
                break;
        }
    }

    private static void AddUniqueRecipient(List<EmailRecipient> recipients, string email, string name)
    {
        if (!recipients.Any(r => r.Email.Equals(email, StringComparison.OrdinalIgnoreCase)))
        {
            recipients.Add(new EmailRecipient(email, name));
        }
    }

    private async Task<Dictionary<string, string>> BuildPlaceholdersAsync(string entityType, Guid entityId, string action)
    {
        var placeholders = new Dictionary<string, string>
        {
            ["Action"] = action,
            ["Timestamp"] = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss UTC"),
            ["EntityType"] = entityType,
            ["RecordLink"] = _entityLinkHelper.GetRecordLink(entityType, entityId)
        };

        // Build entity-specific placeholders
        switch (entityType)
        {
            case SpaceLinxEntities.Requisition:
                var req = await _context.Requisitions
                    .AsNoTracking()
                    .Include(r => r.RequestedBy)
                    .Include(r => r.Project)
                    .FirstOrDefaultAsync(r => r.Id == entityId);
                if (req != null)
                {
                    placeholders["EntityNumber"] = req.ReqNumber;
                    placeholders["Title"] = req.Title ?? "";
                    placeholders["Requestor"] = req.RequestedBy != null
                        ? $"{req.RequestedBy.FirstName} {req.RequestedBy.LastName}" : "";
                    placeholders["Project"] = req.Project?.Name ?? "N/A";
                    placeholders["Priority"] = req.Priority;
                    placeholders["Status"] = req.Status;
                    placeholders["TotalAmount"] = req.TotalEstimatedAmount?.ToString("N2") ?? "N/A";
                    placeholders["Justification"] = req.Justification ?? "";
                }
                break;

            case SpaceLinxEntities.PurchaseOrder:
                var po = await _context.PurchaseOrders
                    .AsNoTracking()
                    .Include(p => p.Buyer)
                    .Include(p => p.Company)
                    .Include(p => p.Project)
                    .FirstOrDefaultAsync(p => p.Id == entityId);
                if (po != null)
                {
                    placeholders["EntityNumber"] = po.Number;
                    placeholders["VendorName"] = po.Company?.Name ?? "N/A";
                    placeholders["Buyer"] = po.Buyer != null
                        ? $"{po.Buyer.FirstName} {po.Buyer.LastName}" : "N/A";
                    placeholders["Project"] = po.Project?.Name ?? "N/A";
                    placeholders["Status"] = po.Status;
                    placeholders["TotalAmount"] = po.TotalAmount.ToString("N2");
                    placeholders["OrderDate"] = po.OrderDate.ToString("yyyy-MM-dd");
                }
                break;
        }

        return placeholders;
    }

    private record EmailRecipient(string Email, string Name);
    private record EntityTemplates(string? SubmittedCode, string? ApprovedCode, string? RejectedCode, string? StageApprovedCode);
}
