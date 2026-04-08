using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

public class RequisitionApprovalService : BaseService, IRequisitionApprovalService
{
    private readonly SpaceLinxContext _context;
    private readonly IApprovalService _approvalService;
    private readonly IApprovalNotificationService _notificationService;
    private readonly ILogger<RequisitionApprovalService> _logger;

    public RequisitionApprovalService(
        SpaceLinxContext context,
        IApprovalService approvalService,
        IApprovalNotificationService notificationService,
        IHttpContextAccessor contextAccessor,
        ILogger<RequisitionApprovalService> logger)
        : base(context, contextAccessor)
    {
        _context = context;
        _approvalService = approvalService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<IActionResult> SubmitForApprovalAsync(Guid requisitionId)
    {
        var requisition = await _context.Requisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
            return new NotFoundObjectResult("Requisition not found");

        if (requisition.Status != RequisitionStatus.Draft)
            return new BadRequestObjectResult("Requisition must be in Draft status to submit");

        // Validate approvers exist
        var approvers = await _approvalService.GetApproversAsync(SpaceLinxEntities.Requisition, requisitionId);
        if (!approvers.Any())
            return new BadRequestObjectResult("At least one approver must be assigned before submission");

        // Update status
        var previousStatus = requisition.Status;
        requisition.Status = RequisitionStatus.Submitted;
        requisition.UpdatedBy = UserEmail;
        requisition.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log the action
        await _approvalService.LogApprovalActionAsync(
            SpaceLinxEntities.Requisition,
            requisitionId,
            ApprovalAction.Submitted,
            UserEmail,
            previousStatus: previousStatus,
            newStatus: requisition.Status);

        // Notify
        await _notificationService.NotifySubmittedAsync(SpaceLinxEntities.Requisition, requisitionId);

        _logger.LogInformation("Requisition {RequisitionId} submitted for approval by {UserEmail}",
            requisitionId, UserEmail);

        return new NoContentResult();
    }

    public async Task<IActionResult> ApproveAsync(Guid requisitionId, string? comment)
    {
        var requisition = await _context.Requisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
            return new NotFoundObjectResult("Requisition not found");

        if (requisition.Status != RequisitionStatus.Submitted)
            return new BadRequestObjectResult("Requisition must be in Submitted status to approve");

        var result = await _approvalService.ApproveAsync(
            SpaceLinxEntities.Requisition, requisitionId, comment, UserEmail);

        if (!result.Success)
            return new BadRequestObjectResult(result.Message);

        if (result.IsFullyApproved)
        {
            var previousStatus = requisition.Status;
            requisition.Status = RequisitionStatus.Approved;
            requisition.ApprovedBy = UserEmail;
            requisition.ApprovedDate = DateTime.UtcNow;
            requisition.UpdatedBy = UserEmail;
            requisition.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _notificationService.NotifyFullyApprovedAsync(SpaceLinxEntities.Requisition, requisitionId);

            _logger.LogInformation("Requisition {RequisitionId} fully approved by {UserEmail}",
                requisitionId, UserEmail);
        }
        else
        {
            await _notificationService.NotifyStageApprovedAsync(
                SpaceLinxEntities.Requisition, requisitionId, result.CurrentStage, UserEmail);

            _logger.LogInformation("Requisition {RequisitionId} stage {Stage} approved by {UserEmail}",
                requisitionId, result.CurrentStage, UserEmail);
        }

        return new OkObjectResult(result);
    }

    public async Task<IActionResult> RejectAsync(Guid requisitionId, string? comment)
    {
        var requisition = await _context.Requisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
            return new NotFoundObjectResult("Requisition not found");

        if (requisition.Status != RequisitionStatus.Submitted)
            return new BadRequestObjectResult("Requisition must be in Submitted status to reject");

        var result = await _approvalService.RejectAsync(
            SpaceLinxEntities.Requisition, requisitionId, comment, UserEmail);

        if (!result.Success)
            return new BadRequestObjectResult(result.Message);

        // Reset to Draft status (per requirements)
        var previousStatus = requisition.Status;
        requisition.Status = RequisitionStatus.Draft;
        requisition.RejectedBy = UserEmail;
        requisition.RejectedDate = DateTime.UtcNow;
        requisition.ApproverComment = comment;
        requisition.UpdatedBy = UserEmail;
        requisition.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _notificationService.NotifyRejectedAsync(
            SpaceLinxEntities.Requisition, requisitionId, UserEmail, comment);

        _logger.LogInformation("Requisition {RequisitionId} rejected by {UserEmail}. Reset to Draft.",
            requisitionId, UserEmail);

        return new NoContentResult();
    }

    public async Task<IActionResult> AddApproversAsync(Guid requisitionId, List<ApprovalWriteModel> approvers)
    {
        var requisition = await _context.Requisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
            return new NotFoundObjectResult("Requisition not found");

        if (requisition.Status != RequisitionStatus.Draft)
            return new BadRequestObjectResult("Can only add approvers when Requisition is in Draft status");

        return await _approvalService.AddApproversAsync(
            SpaceLinxEntities.Requisition, requisitionId, approvers, UserEmail);
    }

    public async Task<IActionResult> UpdateApproversAsync(Guid requisitionId, List<ApprovalWriteModel> approvers)
    {
        var requisition = await _context.Requisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
            return new NotFoundObjectResult("Requisition not found");

        if (requisition.Status != RequisitionStatus.Draft)
            return new BadRequestObjectResult("Can only update approvers when Requisition is in Draft status");

        return await _approvalService.UpdateApproversAsync(
            SpaceLinxEntities.Requisition, requisitionId, approvers, UserEmail);
    }

    public async Task<List<ApprovalReadModel>> GetApprovalHistoryAsync(Guid requisitionId)
    {
        return await _approvalService.GetApproversAsync(SpaceLinxEntities.Requisition, requisitionId);
    }

    public async Task<IActionResult> AddNotificationRecipientsAsync(Guid requisitionId, List<ApprovalNotificationRecipientWriteModel> recipients)
    {
        var requisition = await _context.Requisitions
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
            return new NotFoundObjectResult("Requisition not found");

        foreach (var recipient in recipients)
        {
            var notificationRecipient = new ApprovalNotificationRecipient
            {
                EntityType = SpaceLinxEntities.Requisition,
                EntityId = requisitionId,
                RecipientUserId = recipient.RecipientUserId,
                RecipientType = recipient.RecipientType,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            await _context.ApprovalNotificationRecipients.AddAsync(notificationRecipient);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Added {Count} notification recipients to Requisition {RequisitionId}",
            recipients.Count, requisitionId);

        return new OkResult();
    }
}
