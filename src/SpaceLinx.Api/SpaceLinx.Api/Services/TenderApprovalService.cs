using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

public class TenderApprovalService : BaseService, ITenderApprovalService
{
    private readonly SpaceLinxContext _context;
    private readonly IApprovalService _approvalService;
    private readonly IApprovalNotificationService _notificationService;
    private readonly ITenderService _tenderService;
    private readonly ILogger<TenderApprovalService> _logger;

    public TenderApprovalService(
        SpaceLinxContext context,
        IApprovalService approvalService,
        IApprovalNotificationService notificationService,
        ITenderService tenderService,
        IHttpContextAccessor contextAccessor,
        ILogger<TenderApprovalService> logger)
        : base(context, contextAccessor)
    {
        _context = context;
        _approvalService = approvalService;
        _notificationService = notificationService;
        _tenderService = tenderService;
        _logger = logger;
    }

    public async Task<IActionResult> SubmitForApprovalAsync(Guid tenderId)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft)
            return new BadRequestObjectResult("Tender must be in Draft status to submit");

        // Validate approvers exist
        var approvers = await _approvalService.GetApproversAsync(SpaceLinxEntities.Tender, tenderId);
        if (!approvers.Any())
            return new BadRequestObjectResult("At least one approver must be assigned before submission");

        // Validate line items exist
        var hasLineItems = await _context.TenderLineItems
            .AnyAsync(li => li.TenderId == tenderId && li.DeletedBy == null);
        if (!hasLineItems)
            return new BadRequestObjectResult("Tender must have at least one line item before submission");

        // Validate vendors invited
        var hasVendors = await _context.TenderVendors
            .AnyAsync(v => v.TenderId == tenderId && v.DeletedBy == null);
        if (!hasVendors)
            return new BadRequestObjectResult("At least one vendor must be invited before submission");

        // Update status
        var previousStatus = tender.Status;
        tender.Status = TenderStatus.Submitted;
        tender.UpdatedBy = UserEmail;
        tender.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log the action
        await _approvalService.LogApprovalActionAsync(
            SpaceLinxEntities.Tender,
            tenderId,
            ApprovalAction.Submitted,
            UserEmail,
            previousStatus: previousStatus,
            newStatus: tender.Status);

        // Notify
        await _notificationService.NotifySubmittedAsync(SpaceLinxEntities.Tender, tenderId);

        _logger.LogInformation("Tender {TenderId} submitted for approval by {UserEmail}",
            tenderId, UserEmail);

        return new NoContentResult();
    }

    public async Task<IActionResult> ApproveAsync(Guid tenderId, string? comment)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Submitted)
            return new BadRequestObjectResult("Tender must be in Submitted status to approve");

        var result = await _approvalService.ApproveAsync(
            SpaceLinxEntities.Tender, tenderId, comment, UserEmail);

        if (!result.Success)
            return new BadRequestObjectResult(result.Message);

        if (result.IsFullyApproved)
        {
            var previousStatus = tender.Status;
            tender.Status = TenderStatus.Published;
            tender.PublishDate = DateOnly.FromDateTime(DateTime.UtcNow);
            tender.ApprovedBy = UserEmail;
            tender.ApprovedDate = DateTime.UtcNow;
            tender.UpdatedBy = UserEmail;
            tender.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _notificationService.NotifyFullyApprovedAsync(SpaceLinxEntities.Tender, tenderId);

            _logger.LogInformation("Tender {TenderId} fully approved and published by {UserEmail}",
                tenderId, UserEmail);
        }
        else
        {
            await _notificationService.NotifyStageApprovedAsync(
                SpaceLinxEntities.Tender, tenderId, result.CurrentStage, UserEmail);

            _logger.LogInformation("Tender {TenderId} stage {Stage} approved by {UserEmail}",
                tenderId, result.CurrentStage, UserEmail);
        }

        return new OkObjectResult(result);
    }

    public async Task<IActionResult> RejectAsync(Guid tenderId, string? comment)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Submitted)
            return new BadRequestObjectResult("Tender must be in Submitted status to reject");

        var result = await _approvalService.RejectAsync(
            SpaceLinxEntities.Tender, tenderId, comment, UserEmail);

        if (!result.Success)
            return new BadRequestObjectResult(result.Message);

        // Reset to Draft status
        var previousStatus = tender.Status;
        tender.Status = TenderStatus.Draft;
        tender.RejectedBy = UserEmail;
        tender.RejectedDate = DateTime.UtcNow;
        tender.ApproverComment = comment;
        tender.UpdatedBy = UserEmail;
        tender.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _notificationService.NotifyRejectedAsync(
            SpaceLinxEntities.Tender, tenderId, UserEmail, comment);

        _logger.LogInformation("Tender {TenderId} rejected by {UserEmail}. Reset to Draft.",
            tenderId, UserEmail);

        return new NoContentResult();
    }

    public async Task<IActionResult> AddApproversAsync(Guid tenderId, List<ApprovalWriteModel> approvers)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft)
            return new BadRequestObjectResult("Can only add approvers when Tender is in Draft status");

        return await _approvalService.AddApproversAsync(
            SpaceLinxEntities.Tender, tenderId, approvers, UserEmail);
    }

    public async Task<IActionResult> UpdateApproversAsync(Guid tenderId, List<ApprovalWriteModel> approvers)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft)
            return new BadRequestObjectResult("Can only update approvers when Tender is in Draft status");

        return await _approvalService.UpdateApproversAsync(
            SpaceLinxEntities.Tender, tenderId, approvers, UserEmail);
    }

    public async Task<List<ApprovalReadModel>> GetApprovalHistoryAsync(Guid tenderId)
    {
        return await _approvalService.GetApproversAsync(SpaceLinxEntities.Tender, tenderId);
    }

    public async Task<IActionResult> AddNotificationRecipientsAsync(Guid tenderId, List<ApprovalNotificationRecipientWriteModel> recipients)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        foreach (var recipient in recipients)
        {
            var notificationRecipient = new ApprovalNotificationRecipient
            {
                EntityType = SpaceLinxEntities.Tender,
                EntityId = tenderId,
                RecipientUserId = recipient.RecipientUserId,
                RecipientType = recipient.RecipientType,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            await _context.ApprovalNotificationRecipients.AddAsync(notificationRecipient);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Added {Count} notification recipients to Tender {TenderId}",
            recipients.Count, tenderId);

        return new OkResult();
    }
}
