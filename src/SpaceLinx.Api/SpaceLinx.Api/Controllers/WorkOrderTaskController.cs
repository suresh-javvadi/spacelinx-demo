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
public class WorkOrderTaskController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IImageService imageService, IWorkOrderTaskService workOrderTaskService) :
    GenericRestController<WorkOrderTask, WorkOrderTaskWriteModel, WorkOrderTaskUpdateModel, WorkOrderTaskReadModel, WorkOrderTaskRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("workOrderStep/{workOrderStepId}")]
    public async Task<IActionResult> GetByWorkOrderStep(Guid workOrderStepId)
    {
        var records = await spaceLinxContext.WorkOrderTasks
                            .Where(wot => wot.WorkOrderStepId == workOrderStepId && wot.DeletedBy == null)
                            .AsNoTracking()
                            .ToListAsync();

        if (!records.Any())
        {
            return NotFound("No tasks found for the given WorkOrderStepId.");
        }

        return Ok(records);
    }

    [HttpGet("workorder/{workOrderId}")]
    public async Task<IActionResult> GetByWorkOrder(Guid workOrderId)
    {
        var records = await spaceLinxContext.WorkOrderTasks
                            .AsNoTracking()
                            .Where(x => x.WorkOrderId == workOrderId && x.DeletedBy == null)
                            .ToListAsync();

        return Ok(records);
    }

    [HttpPut("task-picture-update/{workOrderTaskId}/complete")]
    public async Task<IActionResult> TaskPictureUpdate(Guid workOrderTaskId, [FromForm] ImageWriteModel newImage)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await spaceLinxContext.WorkOrderTasks
                .FirstOrDefaultAsync(wot => wot.Id == workOrderTaskId && wot.DeletedBy == null);
            if (record == null)
            {
                return NotFound();
            }

            if(!(record.TaskResponse is "{}") && (record.TaskResponse != null))
            {
                await workOrderTaskService.ImageRemoveFromResponse(record.TaskResponse);
            }

            var createdImage = string.IsNullOrEmpty(newImage.ImageType)
                ? await imageService.UploadImageAsync(newImage, workOrderTaskId, SpaceLinxEntities.WorkOrderTask)
                : await imageService.UploadImageAsync(newImage, workOrderTaskId, SpaceLinxEntities.WorkOrderTask, newImage.ImageType);

            var filePath = createdImage?.FilePath;
            var taskResponse = $@"{{""dataType"": null,""assembly"": null,""test"": null,""picture"": {{""value"": 1,""response"": {{""filePath"": ""{createdImage?.FilePath}"",""imageId"": ""{createdImage?.Id}""}}}},""genealogy"": null}}";
           
            record.Status = "Completed";
            record.TaskResponse = taskResponse;

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new{ filePath });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("complete")]
    public async Task<IActionResult> CompleteTask(Guid workOrderTaskId, string taskResponse)
    {
        var record = await spaceLinxContext.WorkOrderTasks
            .FirstOrDefaultAsync(wot => wot.Id == workOrderTaskId && wot.DeletedBy == null);
        record.Status = "Completed";
        record.TaskResponse = taskResponse;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;
        try
        {
            await spaceLinxContext.SaveChangesAsync();
        }catch(Exception ex)
        {
            throw new ApplicationException(ex.ToString());
        }

        return NoContent();
    }

    [HttpDelete("picture-task/{workOrderTaskId}")]
    public async Task<IActionResult> DeleteWithPicture(Guid workOrderTaskId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await spaceLinxContext.WorkOrderTasks.FindAsync(workOrderTaskId);
            if (record == null)
            {
                return NotFound();
            }

            await workOrderTaskService.ImageRemoveFromResponse(record.TaskResponse);

            record.TaskResponse = "{}";
            record.Status = "Pending";
            record.UpdatedBy = UserEmail;
            record.UpdatedAt = DateTime.UtcNow;

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
