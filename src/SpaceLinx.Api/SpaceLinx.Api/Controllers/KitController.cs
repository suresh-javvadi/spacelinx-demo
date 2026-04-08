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
public class KitController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<Kit, KitWriteModel, KitUpdateModel, KitReadModel, KitRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("{id}")]
    public override async Task<ActionResult<KitReadModel>> Get(Guid id)
    {
        var record = await spaceLinxContext.Kits
            .AsNoTracking()
            .Include(k => k.Location)
            .Include(k => k.MaterialKit)
            .Include(k => k.Part)
            .Include(k => k.WorkOrder)
            .SingleOrDefaultAsync(k => k.Id == id && k.Part.ItemType == null && k.DeletedBy == null);

        if (record is null)
        {
            return NotFound();
        }

        return mapper.Map<KitReadModel>(record);
    }

    [HttpGet("materialkit/{materialkitId}")]
    public async Task<List<KitReadModel>> GetByMaterialKit(Guid materialkitId)
    {
        var records = await spaceLinxContext.Kits
                    .AsNoTracking()
                    .Include(k => k.Location)
                    .Include(k => k.Part)
                    .Include(k => k.WorkOrder)
                    .Where(x => x.MaterialKitId == materialkitId && x.Part.ItemType == null && x.DeletedBy == null)
                    .ToListAsync();

        if (records == null)
        {
            throw new ApplicationException("Kits not found");
        }

        return mapper.Map<List<Kit>, List<KitReadModel>>(records);
    }

    [HttpPut("location/{kitId}/{locationId}")]
    public async Task<IActionResult> UpdateLocationAsync(Guid kitId, Guid locationId)
    {
        var recordFromDatabase = await spaceLinxContext.Kits.FirstOrDefaultAsync(k => k.Id == kitId && k.DeletedBy == null);
        if (recordFromDatabase == null)
        {
            return NotFound();
        }

        var locationRecord = await spaceLinxContext.Locations.FirstOrDefaultAsync(l => l.Id == locationId && l.DeletedBy == null);
        if (locationRecord == null)
        {
            return NotFound();
        }

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            recordFromDatabase.LocationId = locationId;
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

    [HttpPut("{kitId}/confirm-kit")]
    public async Task<IActionResult> ConfirmKit(Guid kitId)
    {
        var recordFromDatabase = await spaceLinxContext.Kits.FirstOrDefaultAsync(k => k.Id == kitId && k.DeletedBy == null);
        if (recordFromDatabase == null)
        {
            return NotFound();
        }

        recordFromDatabase.Status = "Confirmed";
        recordFromDatabase.UpdatedBy = UserEmail;
        recordFromDatabase.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }
}
