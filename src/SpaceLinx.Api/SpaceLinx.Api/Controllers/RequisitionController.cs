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
    [HttpGet("requisition")]
    public async Task<IActionResult> GetRequisition()
    {
        var result = await spaceLinxContext.RequisitionsWithUserVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var record = await spaceLinxContext.Requisitions
            .AsNoTracking()
            .Include(x => x.RequisitionLineItems)
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
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

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

            if (requisitionDetails.LineItems != null && requisitionDetails.LineItems.Any())
            {
                foreach (var item in requisitionDetails.LineItems)
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
