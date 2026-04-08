using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class WorkOrderStepController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<WorkOrderStep, WorkOrderStepWriteModel, WorkOrderStepUpdateModel, WorkOrderStepReadModel, WorkOrderStepRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("workorder/{workOrderId}")]
    public async Task<IActionResult> GetByWorkOrder(Guid workOrderId)
    {
        var records = await spaceLinxContext.WorkOrderSteps
            .AsNoTracking()
            .Where(x => x.WorkOrderId == workOrderId && x.DeletedBy == null)
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("workorder/{workOrderId}/guidestep/{guideStepId}")]
    public async Task<WorkOrderStepReadModel> GetByWorkOrderAndGuideStepId(Guid workOrderId, Guid guideStepId)
    {
        var record = await spaceLinxContext.WorkOrderSteps
            .AsNoTracking()
            .Include(x => x.Manager)
            .Include(x => x.Technician)
            .FirstOrDefaultAsync(x => x.WorkOrderId == workOrderId && x.GuideStepId == guideStepId && x.DeletedBy == null);

        if (record is null)
        {
            return new WorkOrderStepReadModel();
        }

        return mapper.Map<WorkOrderStep, WorkOrderStepReadModel>(record);
    }

    [HttpPut("reset-work-order-step/{workOrderStepId}")]
    public async Task<IActionResult> ResetWorkOrderStep(Guid workOrderStepId)
    {
        await spaceLinxContext.Database.ExecuteSqlRawAsync(
            "call mes.reset_work_order_step({0}, {1})",
            workOrderStepId,
            UserEmail
            );

        return Ok();
    }

    [HttpPut("{id}/capturetime")]
    public async Task<IActionResult> UpdateCaptureTime(Guid id, long capturedTimeInSeconds)
    {
        var workOrderStep = await spaceLinxContext.WorkOrderSteps
            .FirstOrDefaultAsync(wos =>  wos.Id == id && wos.DeletedBy == null);
        if (workOrderStep == null)
        {
            throw new ApplicationException("WorkOrder Step does not exist");
        }

        TimeSpan capturedTime = TimeSpan.FromSeconds(capturedTimeInSeconds);
        workOrderStep.CapturedTime = capturedTime;
        workOrderStep.UpdatedBy = UserEmail;
        workOrderStep.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}/completestep")]
    public async Task<IActionResult> CompleteStep(Guid id, String? comment)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var workOrderStep = await spaceLinxContext.WorkOrderSteps
                .FirstOrDefaultAsync(wos => wos.Id == id && wos.DeletedBy == null);
            if (workOrderStep == null)
            {
                return NotFound();
            }

            workOrderStep.Status = "Completed";
            workOrderStep.Comment = comment ?? null;
            workOrderStep.UpdatedBy = UserEmail;
            workOrderStep.UpdatedAt = DateTime.UtcNow;

            var workOrder = await spaceLinxContext.WorkOrders
                .FirstOrDefaultAsync(wo => wo.Id == workOrderStep.WorkOrderId && wo.DeletedBy == null);
            if (workOrder == null)
            {
                return NotFound();
            }

            workOrder.ExecutionTime ??= TimeSpan.Zero;
            workOrder.ExecutionTime += workOrderStep.CapturedTime;
            workOrder.UpdatedAt = DateTime.UtcNow;
            workOrder.UpdatedBy = UserEmail;

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
}
