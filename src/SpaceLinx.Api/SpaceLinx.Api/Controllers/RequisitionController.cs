using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class RequisitionController(
    SpaceLinxContext spaceLinxContext,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    IRequisitionApprovalService requisitionApprovalService,
    IPurchaseOrderService purchaseOrderService) :
    GenericRestController<Requisition, RequisitionWriteModel, RequisitionUpdateModel, RequisitionReadModel, RequisitionRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet]
    public override async Task<List<RequisitionReadModel>> Get()
    {
        var departmentId = HttpContext.Request.Query.TryGetValue("departmentId", out var depIdRaw)
            && Guid.TryParse(depIdRaw, out var parsed) ? parsed : (Guid?)null;
        var allDepartments = HttpContext.Request.Query.TryGetValue("allDepartments", out var allRaw)
            && bool.TryParse(allRaw, out var parsedAll) && parsedAll;

        Guid? scopedDeptId = departmentId;
        if (scopedDeptId == null && !allDepartments)
        {
            scopedDeptId = await spaceLinxContext.Users
                .AsNoTracking()
                .Where(u => u.Email == UserEmail && u.DeletedBy == null)
                .Select(u => u.DepartmentId)
                .FirstOrDefaultAsync();
        }

        var query = spaceLinxContext.Requisitions
            .AsNoTracking()
            .Include(x => x.RequestedBy)
            .Include(x => x.Project)
            .Include(x => x.Department)
            .Where(x => x.DeletedBy == null);

        if (scopedDeptId.HasValue)
        {
            query = query.Where(x => x.DepartmentId == scopedDeptId);
        }

        var records = await query.ToListAsync();
        return mapper.Map<List<RequisitionReadModel>>(records);
    }

    [HttpGet("requisition")]
    public async Task<IActionResult> GetRequisition()
    {
        var departmentId = HttpContext.Request.Query.TryGetValue("departmentId", out var depIdRaw)
            && Guid.TryParse(depIdRaw, out var parsed) ? parsed : (Guid?)null;
        var allDepartments = HttpContext.Request.Query.TryGetValue("allDepartments", out var allRaw)
            && bool.TryParse(allRaw, out var parsedAll) && parsedAll;

        Guid? scopedDeptId = departmentId;
        if (scopedDeptId == null && !allDepartments)
        {
            scopedDeptId = await spaceLinxContext.Users
                .AsNoTracking()
                .Where(u => u.Email == UserEmail && u.DeletedBy == null)
                .Select(u => u.DepartmentId)
                .FirstOrDefaultAsync();
        }

        var query = spaceLinxContext.RequisitionsWithUserVws.AsNoTracking();

        if (scopedDeptId.HasValue)
        {
            var allowedIds = spaceLinxContext.Requisitions
                .Where(x => x.DepartmentId == scopedDeptId && x.DeletedBy == null)
                .Select(x => x.Id);
            query = query.Where(x => allowedIds.Contains(x.Id));
        }

        var result = await query.ToListAsync();
        return Ok(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var record = await spaceLinxContext.Requisitions
            .AsNoTracking()
            .Include(x => x.RequisitionLineItems.Where(li => li.DeletedBy == null))
                .ThenInclude(li => li.Part)
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        var requisition = mapper.Map<RequisitionDetailsReadModel>(record);

        var approvals = await requisitionApprovalService.GetApprovalHistoryAsync(id);

        return Ok(new
        {
            Requisition = requisition,
            Approvals = approvals
        });
    }

    [HttpGet("Status")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var records = await spaceLinxContext.Requisitions
            .AsNoTracking()
            .Where(x => x.Status == status && x.DeletedBy == null)
            .ToListAsync();

        return Ok(records);
    }

    [HttpPost("requisition-details")]
    public async Task<IActionResult> CreateRequisition([FromBody] RequisitionCreateModel requisitionCreateWithLineItems)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var requisition = new Requisition
            {
                RequestedById = requisitionCreateWithLineItems.RequestedById,
                RequestDate = DateOnly.FromDateTime(DateTime.Now),
                Title = requisitionCreateWithLineItems.Title,
                ProjectId = requisitionCreateWithLineItems.ProjectId,
                RequiredByDate = requisitionCreateWithLineItems.RequiredByDate,
                Justification = requisitionCreateWithLineItems.Justification,
                Priority = requisitionCreateWithLineItems.Priority,
                TotalEstimatedAmount = requisitionCreateWithLineItems.TotalEstimatedAmount,
                DepartmentId = requisitionCreateWithLineItems.DepartmentId,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            if (requisition.DepartmentId == null)
            {
                requisition.DepartmentId = await spaceLinxContext.Users
                    .Where(u => u.Id == requisitionCreateWithLineItems.RequestedById && u.DeletedBy == null)
                    .Select(u => u.DepartmentId)
                    .FirstOrDefaultAsync();
            }

            spaceLinxContext.Requisitions.Add(requisition);
            await spaceLinxContext.SaveChangesAsync();

            if (requisitionCreateWithLineItems.LineItems != null && requisitionCreateWithLineItems.LineItems.Any())
            {
                foreach (var item in requisitionCreateWithLineItems.LineItems)
                {
                    var lineItem = new RequisitionLineItem
                    {
                        RequisitionId = requisition.Id.Value,
                        PartId = item.PartId,
                        Quantity = item.Quantity,
                        Description = item.Description,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };

                    spaceLinxContext.RequisitionLineItems.Add(lineItem);
                }

                await spaceLinxContext.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            return CreatedAtAction(nameof(Get), new { id = requisition.Id }, requisition);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("requisition-details-update/{id}")]
    public async Task<IActionResult> UpdateRequisition(Guid id, [FromBody] RequisitionAlterModel requisitionDetails)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var requisitionRecord = await spaceLinxContext.Requisitions
                .Include(r => r.RequisitionLineItems)
                .FirstOrDefaultAsync(r => r.Id == id && r.DeletedBy == null);

            if (requisitionRecord == null)
            {
                return NotFound($"Requisition with ID {id} not found.");
            }

            requisitionRecord.RequestedById = requisitionDetails.RequestedById;
            requisitionRecord.RequestDate = requisitionDetails.RequestDate;
            requisitionRecord.Title = requisitionDetails.Title;
            requisitionRecord.ProjectId = requisitionDetails.ProjectId;
            requisitionRecord.RequiredByDate = requisitionDetails.RequiredByDate;
            requisitionRecord.Justification = requisitionDetails.Justification;
            requisitionRecord.Priority = requisitionDetails.Priority;
            requisitionRecord.TotalEstimatedAmount = requisitionDetails.TotalEstimatedAmount;
            requisitionRecord.ApprovedBy = requisitionDetails.ApprovedBy;
            requisitionRecord.ApprovedDate = requisitionDetails.ApprovedDate;
            requisitionRecord.RejectedBy = requisitionDetails.RejectedBy;
            requisitionRecord.RejectedDate = requisitionDetails.RejectedDate;
            requisitionRecord.ApproverComment = requisitionDetails.ApproverComment;
            requisitionRecord.UpdatedBy = UserEmail;
            requisitionRecord.UpdatedAt = DateTime.UtcNow;
            requisitionRecord.IsActive = true;

            spaceLinxContext.Requisitions.Update(requisitionRecord);
            await spaceLinxContext.SaveChangesAsync();

            // Determine which line item IDs are present in the incoming payload
            var incomingLineItems = requisitionDetails.LineItems?.ToList()
                ?? new List<RequisitionLineItemAlterModel>();

            var incomingItemIds = incomingLineItems
                .Where(item => item.Id.HasValue && item.Id != Guid.Empty)
                .Select(item => item.Id!.Value)
                .ToHashSet();

            // Soft-delete any existing line items that are NOT in the incoming payload
            var orphanedLineItems = requisitionRecord.RequisitionLineItems
                .Where(li => li.DeletedBy == null && !incomingItemIds.Contains(li.Id!.Value))
                .ToList();

            foreach (var orphan in orphanedLineItems)
            {
                orphan.DeletedAt = DateTime.UtcNow;
                orphan.DeletedBy = UserEmail;
                orphan.IsActive = false;
                spaceLinxContext.RequisitionLineItems.Update(orphan);
            }

            await spaceLinxContext.SaveChangesAsync();

            // Upsert the remaining / new line items
            foreach (var item in incomingLineItems)
            {
                var existingLineItem = await spaceLinxContext.RequisitionLineItems
                        .FirstOrDefaultAsync(li => li.Id == item.Id && li.RequisitionId == requisitionRecord.Id && li.DeletedBy == null);

                if (existingLineItem == null)
                {
                    var newLineItem = new RequisitionLineItem
                    {
                        RequisitionId = requisitionRecord.Id.Value,
                        PartId = item.PartId,
                        Quantity = item.Quantity,
                        Description = item.Description,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };

                    await spaceLinxContext.RequisitionLineItems.AddAsync(newLineItem);
                    await spaceLinxContext.SaveChangesAsync();
                }
                else
                {
                    existingLineItem.PartId = item.PartId;
                    existingLineItem.Quantity = item.Quantity;
                    existingLineItem.Description = item.Description;
                    existingLineItem.UpdatedBy = UserEmail;
                    existingLineItem.UpdatedAt = DateTime.UtcNow;
                    existingLineItem.IsActive = true;

                    spaceLinxContext.RequisitionLineItems.Update(existingLineItem);
                    await spaceLinxContext.SaveChangesAsync();
                }
            }

            if (requisitionDetails.Approvals?.Any() == true)
            {
                await requisitionApprovalService.UpdateApproversAsync(id, requisitionDetails.Approvals);
            }

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { message = "Requisition updated successfully", requisitionId = requisitionRecord.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    #region Multi-Level Approval Endpoints

    [HttpPost("{id}/approvers")]
    public async Task<IActionResult> AddApprovers(Guid id, [FromBody] List<ApprovalWriteModel> approvers)
    {
        return await requisitionApprovalService.AddApproversAsync(id, approvers);
    }

    [HttpPut("{id}/approvers")]
    public async Task<IActionResult> UpdateApprovers(Guid id, [FromBody] List<ApprovalWriteModel> approvers)
    {
        return await requisitionApprovalService.UpdateApproversAsync(id, approvers);
    }

    [HttpGet("{id}/approval-history")]
    public async Task<IActionResult> GetApprovalHistory(Guid id)
    {
        var result = await requisitionApprovalService.GetApprovalHistoryAsync(id);
        return Ok(result);
    }

    [HttpPost("{id}/notification-recipients")]
    public async Task<IActionResult> AddNotificationRecipients(Guid id, [FromBody] List<ApprovalNotificationRecipientWriteModel> recipients)
    {
        return await requisitionApprovalService.AddNotificationRecipientsAsync(id, recipients);
    }

    [HttpPut("submit/{id}")]
    public async Task<IActionResult> Submit(Guid id)
    {
        return await requisitionApprovalService.SubmitForApprovalAsync(id);
    }

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(Guid id, [FromQuery] string? comment = null)
    {
        return await requisitionApprovalService.ApproveAsync(id, comment);
    }

    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(Guid id, [FromQuery] string? comment = null)
    {
        return await requisitionApprovalService.RejectAsync(id, comment);
    }

    #endregion

    [HttpPost("{id}/create-purchase-order")]
    public async Task<IActionResult> CreatePurchaseOrder(
        Guid id,
        [FromBody] CreatePurchaseOrderFromRequisitionModel model)
    {
        try
        {
            var purchaseOrder = await purchaseOrderService.CreateFromRequisitionAsync(id, model);
            return Ok(new
            {
                PurchaseOrderId = purchaseOrder.Id,
                Number = purchaseOrder.Number
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("requisition-delete/{id}")]
    public async Task<IActionResult> DeleteRequisition(Guid id)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var requisition = await spaceLinxContext.Requisitions
                .Include(r => r.RequisitionLineItems)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (requisition == null)
            {
                return NotFound($"Requisition with ID {id} not found.");
            }

            if (requisition.RequisitionLineItems?.Any() == true)
            {
                foreach (var li in requisition.RequisitionLineItems)
                {
                    li.DeletedAt = DateTime.UtcNow;
                    li.DeletedBy = UserEmail;
                    li.IsActive = false;
                }
            }

            await RemoveAsync(id);

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Internal server error");
        }
    }
}
