using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class PurchaseOrderApprovalService : BaseService, IPurchaseOrderApprovalService
{
    private readonly SpaceLinxContext _context;
    private readonly IApprovalService _approvalService;
    private readonly IApprovalNotificationService _notificationService;
    private readonly ILogger<PurchaseOrderApprovalService> _logger;

    public PurchaseOrderApprovalService(
        SpaceLinxContext context,
        IApprovalService approvalService,
        IApprovalNotificationService notificationService,
        IHttpContextAccessor contextAccessor,
        ILogger<PurchaseOrderApprovalService> logger)
        : base(context, contextAccessor)
    {
        _context = context;
        _approvalService = approvalService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<IActionResult> SubmitForApprovalAsync(Guid poId)
    {
        var po = await _context.PurchaseOrders
            .FirstOrDefaultAsync(p => p.Id == poId && p.DeletedBy == null);

        if (po == null)
            return new NotFoundObjectResult("Purchase Order not found");

        if (po.Status != PoStatus.Draft)
            return new BadRequestObjectResult("Purchase Order must be in Draft status to submit");

        // Validate approvers exist
        var approvers = await _approvalService.GetApproversAsync(SpaceLinxEntities.PurchaseOrder, poId);
        if (!approvers.Any())
            return new BadRequestObjectResult("At least one approver must be assigned before submission");

        // Update status
        var previousStatus = po.Status;
        po.Status = PoStatus.Submitted;
        po.UpdatedBy = UserEmail;
        po.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Log the action
        await _approvalService.LogApprovalActionAsync(
            SpaceLinxEntities.PurchaseOrder,
            poId,
            ApprovalAction.Submitted,
            UserEmail,
            previousStatus: previousStatus,
            newStatus: po.Status);

        // Notify
        await _notificationService.NotifySubmittedAsync(SpaceLinxEntities.PurchaseOrder, poId);

        _logger.LogInformation("PurchaseOrder {PoId} submitted for approval by {UserEmail}",
            poId, UserEmail);

        return new NoContentResult();
    }

    public async Task<IActionResult> ApproveAsync(Guid poId, string? comment)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var po = await _context.PurchaseOrders
                .Include(p => p.PoLineItems)
                .FirstOrDefaultAsync(p => p.Id == poId && p.DeletedBy == null);

            if (po == null)
                return new NotFoundObjectResult("Purchase Order not found");

            if (po.Status != PoStatus.Submitted)
                return new BadRequestObjectResult("Purchase Order must be in Submitted status to approve");

            var result = await _approvalService.ApproveAsync(
                SpaceLinxEntities.PurchaseOrder, poId, comment, UserEmail);

            if (!result.Success)
            {
                await transaction.RollbackAsync();
                return new BadRequestObjectResult(result.Message);
            }

            if (result.IsFullyApproved)
            {
                var previousStatus = po.Status;
                po.Status = PoStatus.Issued;
                po.ApprovedBy = UserEmail;
                po.ApprovedDate = DateTime.UtcNow;
                po.UpdatedBy = UserEmail;
                po.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Update part prices from PO line items (preserving existing logic)
                await UpdatePartPricesFromPoLineItemsAsync(po);

                await transaction.CommitAsync();

                await _notificationService.NotifyFullyApprovedAsync(SpaceLinxEntities.PurchaseOrder, poId);

                _logger.LogInformation("PurchaseOrder {PoId} fully approved and issued by {UserEmail}",
                    poId, UserEmail);
            }
            else
            {
                await transaction.CommitAsync();

                await _notificationService.NotifyStageApprovedAsync(
                    SpaceLinxEntities.PurchaseOrder, poId, result.CurrentStage, UserEmail);

                _logger.LogInformation("PurchaseOrder {PoId} stage {Stage} approved by {UserEmail}",
                    poId, result.CurrentStage, UserEmail);
            }

            return new OkObjectResult(result);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error approving PurchaseOrder {PoId}", poId);
            throw;
        }
    }

    public async Task<IActionResult> RejectAsync(Guid poId, string? comment)
    {
        var po = await _context.PurchaseOrders
            .FirstOrDefaultAsync(p => p.Id == poId && p.DeletedBy == null);

        if (po == null)
            return new NotFoundObjectResult("Purchase Order not found");

        if (po.Status != PoStatus.Submitted)
            return new BadRequestObjectResult("Purchase Order must be in Submitted status to reject");

        var result = await _approvalService.RejectAsync(
            SpaceLinxEntities.PurchaseOrder, poId, comment, UserEmail);

        if (!result.Success)
            return new BadRequestObjectResult(result.Message);

        // Reset to Draft status (per requirements)
        var previousStatus = po.Status;
        po.Status = PoStatus.Draft;
        po.RejectedBy = UserEmail;
        po.RejectedDate = DateTime.UtcNow;
        po.UpdatedBy = UserEmail;
        po.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _notificationService.NotifyRejectedAsync(
            SpaceLinxEntities.PurchaseOrder, poId, UserEmail, comment);

        _logger.LogInformation("PurchaseOrder {PoId} rejected by {UserEmail}. Reset to Draft.",
            poId, UserEmail);

        return new NoContentResult();
    }

    public async Task<IActionResult> AddApproversAsync(Guid poId, List<ApprovalWriteModel> approvers)
    {
        var po = await _context.PurchaseOrders
            .FirstOrDefaultAsync(p => p.Id == poId && p.DeletedBy == null);

        if (po == null)
            return new NotFoundObjectResult("Purchase Order not found");

        if (po.Status != PoStatus.Draft)
            return new BadRequestObjectResult("Can only add approvers when Purchase Order is in Draft status");

        return await _approvalService.AddApproversAsync(
            SpaceLinxEntities.PurchaseOrder, poId, approvers, UserEmail);
    }

    public async Task<IActionResult> UpdateApproversAsync(Guid poId, List<ApprovalWriteModel> approvers)
    {
        var po = await _context.PurchaseOrders
            .FirstOrDefaultAsync(p => p.Id == poId && p.DeletedBy == null);

        if (po == null)
            return new NotFoundObjectResult("Purchase Order not found");

        if (po.Status != PoStatus.Draft)
            return new BadRequestObjectResult("Can only update approvers when Purchase Order is in Draft status");

        return await _approvalService.UpdateApproversAsync(
            SpaceLinxEntities.PurchaseOrder, poId, approvers, UserEmail);
    }

    public async Task<List<ApprovalReadModel>> GetApprovalHistoryAsync(Guid poId)
    {
        return await _approvalService.GetApproversAsync(SpaceLinxEntities.PurchaseOrder, poId);
    }

    public async Task<IActionResult> AddNotificationRecipientsAsync(Guid poId, List<ApprovalNotificationRecipientWriteModel> recipients)
    {
        var po = await _context.PurchaseOrders
            .FirstOrDefaultAsync(p => p.Id == poId && p.DeletedBy == null);

        if (po == null)
            return new NotFoundObjectResult("Purchase Order not found");

        foreach (var recipient in recipients)
        {
            var notificationRecipient = new ApprovalNotificationRecipient
            {
                EntityType = SpaceLinxEntities.PurchaseOrder,
                EntityId = poId,
                RecipientUserId = recipient.RecipientUserId,
                RecipientType = recipient.RecipientType,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            await _context.ApprovalNotificationRecipients.AddAsync(notificationRecipient);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Added {Count} notification recipients to PurchaseOrder {PoId}",
            recipients.Count, poId);

        return new OkResult();
    }

    public async Task<List<PurchaseOrdersVw>> GetMyApprovalsAsync()
    {
        // 1. Resolve the current user
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email.ToLower() == UserEmail && u.DeletedBy == null);

        if (user == null)
            return new List<PurchaseOrdersVw>();

        // 2. Get purchase order IDs where this user is an approver (any status, any stage)
        var pendingPoIds = await (
            from a in _context.Approvals
            where a.EntityType == SpaceLinxEntities.PurchaseOrder
               && a.ApproverId == user.Id
               && a.DeletedBy == null
            select a.EntityId
        ).Distinct().ToListAsync();

        if (!pendingPoIds.Any())
            return new List<PurchaseOrdersVw>();

        // 3. Fetch the purchase orders with related data for the grid from the view
        var purchaseOrders = await _context.PurchaseOrdersVws
            .AsNoTracking()
            .Where(r => pendingPoIds.Contains(r.Id.Value))
            .ToListAsync();

        return purchaseOrders;
    }

    /// <summary>
    /// Updates part unit prices from PO line items when PO is fully approved
    /// This preserves the existing business logic from PurchaseOrderController.Approve
    /// </summary>
    private async Task UpdatePartPricesFromPoLineItemsAsync(PurchaseOrder po)
    {
        var partIds = po.PoLineItems.Select(item => item.PartId).ToList();

        var parts = await _context.Parts
            .Where(p => partIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        foreach (var item in po.PoLineItems)
        {
            if (parts.TryGetValue(item.PartId, out var part))
            {
                part.UnitPrice = item.UnitPrice;
                part.UpdatedAt = DateTime.UtcNow;
                part.UpdatedBy = UserEmail;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated {Count} part prices from PO {PoNumber} line items",
            po.PoLineItems.Count, po.Number);
    }
}
