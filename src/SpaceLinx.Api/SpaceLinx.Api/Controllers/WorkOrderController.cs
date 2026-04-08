using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class WorkOrderController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IWorkOrderService workOrderService) :
    GenericRestController<WorkOrder, WorkOrderWriteModel, WorkOrderUpdateModel, WorkOrderReadModel, WorkOrderRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("number/{number}")]
    public async Task<ActionResult<WorkOrderReadModel>> GetByNumber(string number)
    {
        var record = await workOrderService.GetByNumberAsync(number);

        if (record == null)
        {
            return NotFound();
        }

        return record;
    }

    [HttpGet("{id}")]
    public override async Task<ActionResult<WorkOrderReadModel>> Get(Guid id)
    {
        var record = await workOrderService.GetAsync(id);

        return record;
    }

    [HttpGet("{id}/details")]
    public async Task<WorkOrderDetailReadModel> GetWorkOrderDetails(Guid id)
    {
        var record = await workOrderService.GetWorkOrderDetailsAsync(id);

        return record;
    }

    [HttpGet("work-package/{workPackageId}")]
    public async Task<ActionResult> GetByWorkPackage(Guid workPackageId)
    {
        var records = await workOrderService.GetByWorkPackageAsync(workPackageId);

        return Ok(records);
    }

    [HttpGet("get-by-part/{partId}")]
    public async Task<List<WorkOrderReadModel>> GetByPart(Guid partId)
    {
        var records = await workOrderService.GetByPartAsync(partId);

        return records;
    }

    [HttpGet("product/{productId}/part/{partId}")]
    public async Task<List<WorkOrderReadModel>> GetByProductAndPart(Guid productId, Guid partId)
    {
        var records = await workOrderService.GetByProductAndPartAsync(productId, partId);

        return records;
    }

    [HttpGet("technician-assigned")]
    public async Task<IActionResult> WorkOrdersWithTechnicianAssigned()
    {
        var records = await workOrderService.WorkOrdersWithTechnicianAssignedAsync();

        return Ok(records);
    }

    [HttpGet("work-order-guide-steps-view/{workOrderId}")]
    public async Task<IActionResult> Workorderguidestepsview(Guid workOrderId)
    {
        var records = await workOrderService.WorkorderguidestepsviewAsync(workOrderId);

        return Ok(records);
    }

    [HttpPut("{workOrderId}/technician/{technicianId}")]
    public async Task<IActionResult> updateTechnician(Guid workOrderId, Guid technicianId)
    {
        var record = await spaceLinxContext.WorkOrders
            .FirstOrDefaultAsync(wo =>  wo.Id == workOrderId && wo.DeletedBy == null);
        if (record is null)
        {
            return NotFound();
        }

        if (record.Status == "InProgress")
        {
            return StatusCode(500, $"Internal server error: Workorder is in progress");
        }

        var technician = await spaceLinxContext.Users
            .FirstOrDefaultAsync(u => u.Id == technicianId && u.DeletedBy == null);
        if(technician is null)
        {
            return NotFound();
        }

        record.TechnicianId = technician.Id;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}")]
    public override async Task<IActionResult> Update(Guid id, WorkOrderUpdateModel recordToUpdate)
    {
        var recordFromDatabase = await spaceLinxContext.WorkOrders
            .FirstOrDefaultAsync(wo => wo.Id == id && wo.DeletedBy == null);
        if (recordFromDatabase is null)
        {
            return NotFound();
        }

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            if (recordFromDatabase.KitId != null && recordFromDatabase.KitId != recordToUpdate.KitId)
            {
                //Reverting back to the Old Kit Status
                await updateKitStatusAsync(recordFromDatabase.KitId, "Confirmed");
            }

            if (recordToUpdate.KitId != null)
            {
                await updateKitStatusAsync(recordToUpdate.KitId, "Assigned");
            }

            recordFromDatabase = mapper.Map<WorkOrderUpdateModel, WorkOrder>(recordToUpdate, recordFromDatabase);
            recordFromDatabase.UpdatedBy = UserEmail;
            recordFromDatabase.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    private async Task updateKitStatusAsync(Guid? kitId, string status)
    {
        var kit = await spaceLinxContext.Kits.FindAsync(kitId);
        kit.Status = status;
        kit.UpdatedBy = UserEmail;
        kit.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
    }

    [HttpPut("{workOrderId}/assign-kit/{newKitId}")]
    public async Task<IActionResult> AssignKit(Guid workOrderId, Guid newKitId)
    {
        var workOrder = await spaceLinxContext.WorkOrders
            .Include(x => x.Kit)
            .FirstOrDefaultAsync(x => x.Id == workOrderId && x.DeletedBy == null);

        if (workOrder == null)
        {
            return NotFound();
        }

        if (workOrder.KitId == newKitId)
        {
            return NoContent();
        }

        var kit = await spaceLinxContext.Kits
            .FirstOrDefaultAsync(k => k.Id == newKitId && k.DeletedBy == null);
        if (kit == null)
        {
            return NotFound();
        }

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var existingWorkOrder = await spaceLinxContext.WorkOrders
                .FirstOrDefaultAsync(wo => wo.KitId == newKitId && wo.DeletedBy == null);

            if (existingWorkOrder != null)
            {
                if (existingWorkOrder.Status == "Pending")
                {
                    existingWorkOrder.KitId = null;
                    existingWorkOrder.UpdatedBy = UserEmail;
                    existingWorkOrder.UpdatedAt = DateTime.UtcNow;
                    await updateKitStatusAsync(newKitId, "Pending");
                }
                else
                {
                    return BadRequest("The kit is assigned to a work order that is not in 'Pending' status.");
                }
            }

            if (workOrder.KitId != null)
            {
                await updateKitStatusAsync(workOrder.KitId, "Pending");
            }

            await updateKitStatusAsync(newKitId, "Assigned");

            workOrder.KitId = newKitId;
            workOrder.UpdatedBy = UserEmail;
            workOrder.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                "CALL mes.reserve_inventory_for_kit({0}, {1}, {2}, {3})",
                kit.PartId, 1, UserEmail, workOrder.Id
            );

            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("unassign-kit/{workOrderId}")]
    public async Task<IActionResult> UnAssignKit(Guid workOrderId)
    {
        var workOrder = await spaceLinxContext.WorkOrders
            .Include(x => x.Kit)
            .FirstOrDefaultAsync(x => x.Id == workOrderId && x.DeletedBy == null);

        if (workOrder == null)
        {
            return NotFound();
        }

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            await updateKitStatusAsync(workOrder.KitId, "Pending");

            workOrder.KitId = null;
            workOrder.UpdatedBy = UserEmail;
            workOrder.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                "CALL mes.revert_inventory_for_kit({0}, {1}, {2}, {3})",
                workOrder.Kit.PartId, 1, UserEmail, workOrder.Id
            );

            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{workOrderId}/start")]
    public async Task<IActionResult> UpdateWorkOrderStatusToInProgress(Guid workOrderId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var workOrder = await spaceLinxContext.WorkOrders
                .FirstOrDefaultAsync(wo => wo.Id == workOrderId && wo.DeletedBy == null);
            if (workOrder == null)
            {
                return NotFound();
            }

            var workPackage = await spaceLinxContext.WorkPackages
                .FirstOrDefaultAsync(wp => wp.Id == workOrder.WorkPackageId && wp.DeletedBy == null);

            if (workPackage != null && workPackage.ActualStartDate == null)
            {
                workPackage.ActualStartDate = DateTime.UtcNow;
                workPackage.Status = "InProgress";
                workPackage.UpdatedBy = UserEmail;
                workPackage.UpdatedAt = DateTime.UtcNow;
            }

            workOrder.ActualStartDate = DateTime.UtcNow;
            workOrder.Status = "InProgress";
            workOrder.UpdatedBy = UserEmail;
            workOrder.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{workOrderId}/complete")]
    public async Task<IActionResult> UpdateWorkOrderStatusToComplete(Guid workOrderId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var workOrder = await spaceLinxContext.WorkOrders
                .Include(x => x.Kit)
                .FirstOrDefaultAsync(x => x.Id == workOrderId && x.DeletedBy == null);

            if (workOrder == null)
            {
                return NotFound();
            }

            workOrder.ActualEndDate = DateTime.UtcNow;
            workOrder.Status = "Completed";
            workOrder.UpdatedBy = UserEmail;
            workOrder.UpdatedAt = DateTime.UtcNow;

            var workPackage = await spaceLinxContext.WorkPackages
                                    .Include(wp => wp.WorkOrders)
                                    .FirstOrDefaultAsync(wp => wp.Id == workOrder.WorkPackageId && wp.DeletedBy == null);

            if (workPackage != null)
            {
                var allWorkOrdersCompleted = workPackage.WorkOrders.All(wo => wo.Status == "Completed");

                if (allWorkOrdersCompleted)
                {
                    workPackage.Status = "Completed";
                    workPackage.ActualEndDate = DateTime.UtcNow;
                    workPackage.UpdatedBy = UserEmail;
                    workPackage.UpdatedAt = DateTime.UtcNow;
                }
            }

            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                "CALL mes.consume_inventory_for_kit({0}, {1}, {2}, {3})",
                workOrder.Kit.PartId, 1, UserEmail, workOrder.Id
            );

            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("Reset-Work-Order/{workOrderId}")]
    public async Task<IActionResult> ResetWorkOrder(Guid workOrderId)
    {
        await spaceLinxContext.Database.ExecuteSqlRawAsync(
            "CALL mes.reset_work_order({0}, {1})",
            workOrderId,
            UserEmail
            );

        return Ok();
    }   
}