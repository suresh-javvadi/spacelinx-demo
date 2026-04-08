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
public class GuideStepEquipmentController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<GuideStepEquipment, GuideStepEquipmentWriteModel, GuideStepEquipmentUpdateModel, GuideStepEquipmentReadModel, GuideStepEquipmentRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet]
    public override async Task<List<GuideStepEquipmentReadModel>> Get()
    {
        var query = spaceLinxContext.GuideStepEquipments
        .AsNoTracking()
        .Include(x => x.Tool.ToolType)
        .Include(x => x.Machine.MachineType)
        .Include(x => x.Part.PartType)
        .Where(x => x.DeletedBy == null);

        var records = await query.ToListAsync();
        return mapper.Map<List<GuideStepEquipment>, List<GuideStepEquipmentReadModel>>(records);
    }

    [HttpGet("step/{stepId}")]
    public async Task<List<GuideStepEquipmentReadModel>> GetByStep(Guid stepId)
    {
        var records = spaceLinxContext.GuideStepEquipments
        .AsNoTracking()
        .Include(x => x.Tool.ToolType)
        .Include(x => x.Machine.MachineType)
        .Include(x => x.Part.PartType)
        .Where(x => x.GuideStepId == stepId && x.DeletedBy == null)
        .ToList();

        return mapper.Map<List<GuideStepEquipment>, List<GuideStepEquipmentReadModel>>(records);
    }

    [HttpGet("guide/{guideId}")]
    public async Task<List<GuideStepEquipmentReadModel>> GetByGuide(Guid guideId)
    {
        var records = spaceLinxContext.GuideStepEquipments
         .AsNoTracking()
         .Include(x => x.Tool.ToolType)
         .Include(x => x.Machine.MachineType)
         .Include(x => x.Part.PartType)
         .Include(x => x.GuideStep)
         .Where(x => x.GuideId == guideId && x.DeletedBy == null)
         .ToList();

        return mapper.Map<List<GuideStepEquipment>, List<GuideStepEquipmentReadModel>>(records);
    }

    [HttpPost]
    public override async Task<IActionResult> Post(GuideStepEquipmentWriteModel newRecord)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await CreateAsync(newRecord);

            await spaceLinxContext.Database.ExecuteSqlRawAsync("CALL mes.guide_mbom_refresh()");

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(Get), new { id = record?.Id }, record);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public override async Task<IActionResult> Update(Guid id, GuideStepEquipmentUpdateModel updatedRecord)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var existingRecord = await GetAsync(id);

            if (existingRecord is null)
            {
                return NotFound();
            }

            updatedRecord.Id = existingRecord.Id;

            await UpdateAsync(id, updatedRecord);

            await spaceLinxContext.Database.ExecuteSqlRawAsync("CALL mes.guide_mbom_refresh()");

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await spaceLinxContext.GuideStepEquipments.FindAsync(id);
            if (record == null)
            {
                return NotFound();
            }

            await RemoveAsync(id);

            await spaceLinxContext.Database.ExecuteSqlRawAsync("CALL mes.guide_mbom_refresh()");

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Internal server error");
        }
    }
}
