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
public class GuideStepTaskController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor,IGuideService guideService) :
    GenericRestController<GuideStepTask, GuideStepTaskWriteModel, GuideStepTaskUpdateModel, GuideStepTaskReadModel, GuideStepTaskRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("guidestep/{guideStepId}")]
    public async Task<List<GuideStepTaskReadModel>> GetByGuideStep(Guid guideStepId)
    {
        var records = await spaceLinxContext.GuideStepTasks
        .AsNoTracking()
        .Where(x => x.GuideStepId == guideStepId && x.DeletedBy == null)
        .ToListAsync();

        return mapper.Map<List<GuideStepTask>, List<GuideStepTaskReadModel>>(records);
    }

    [HttpPost]
    public override async Task<IActionResult> Post(GuideStepTaskWriteModel newRecord)
    {
        var record = mapper.Map<GuideStepTask>(newRecord);
        record.IsActive = true;
        record.CreatedBy = UserEmail;

        var records = await spaceLinxContext.GuideStepTasks.AsNoTracking()
                                .Where(x => x.GuideStepId == record.GuideStepId && x.DeletedBy == null)
                                .ToListAsync();

        var lastSequence = records.Max(r => r.Sequence);
        record.Sequence = (lastSequence ?? 0) + 1;

        spaceLinxContext.GuideStepTasks.Add(record);

        await spaceLinxContext.SaveChangesAsync();
           
        return CreatedAtAction(nameof(Get), new { id = record?.Id }, record);
    }

    [HttpPut("{id}")]
    public override async Task<IActionResult> Update(Guid id, GuideStepTaskUpdateModel updatedRecord)
    {
        var record = await GetAsync(id);

        if (record is null)
        {
            return NotFound();
        }

        await guideService.ValidateGuideStatusAsync(record.GuideId, "Guide is published, so cannot update task.");

        updatedRecord.Id = record.Id;
        updatedRecord.Sequence = record.Sequence;

        await UpdateAsync(id, updatedRecord);

        return NoContent();
    }

    [HttpPut("reorder-task")]
    public async Task<IActionResult> ReorderTask(Guid guideStepTaskId, int newSequence)
    {
        var guideStepTask = await GetAsync(guideStepTaskId);
        if (guideStepTask == null)
        {
            return NotFound();
        }

        await guideService.ValidateGuideStatusAsync(guideStepTask.GuideId, "Guide is published, so the tasks cannot be reordered.");

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                        "call mes.reorder_guide_step_tasks({0}, {1})",
                        guideStepTask.Id,
                        newSequence
                    );

        return NoContent();
    }

    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        var record = await GetAsync(id);

        if (record == null)
        {
            return NotFound();
        }

        await guideService.ValidateGuideStatusAsync(record.GuideId, "Guide is published, so task cannot be deleted.");

        await RemoveAsync(id);

        return NoContent();
    }
}