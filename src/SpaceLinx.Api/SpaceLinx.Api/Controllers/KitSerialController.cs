using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class KitSerialController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<KitSerial, KitSerialWriteModel, KitSerialUpdateModel, KitSerialReadModel, KitSerialRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("kit/{kitId}")]
    public async Task<List<KitSerialReadModel>> GetByKit(Guid kitId)
    {
        var records = await spaceLinxContext.KitSerials.AsNoTracking().Where(x => x.KitId == kitId && x.DeletedBy == null).ToListAsync();
        if (records == null)
        {
            throw new ApplicationException("No KitSerials found");
        }

        return mapper.Map<List<KitSerial>, List<KitSerialReadModel>>(records);
    }

    [HttpGet("kit/{kitId}/part/{partId}")]
    public async Task<List<KitSerialReadModel>> GetByKitAndPart(Guid kitId, Guid partId)
    {
        var records = await spaceLinxContext.KitSerials
            .AsNoTracking()
            .Include(x => x.Part)
            .Where(x => x.KitId == kitId && x.PartId == partId && x.Part.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<KitSerial>, List<KitSerialReadModel>>(records);
    }

    [HttpPut("kit/{kitId}/part/{partId}")]
    public async Task<IActionResult> UpdateSerial(Guid kitId, Guid partId, KitSerialAndCommentsWriteModel kitSerialAndComments)
    {
        var serialsToDelete = await spaceLinxContext.KitSerials
                                    .Where(x => x.KitId == kitId && x.PartId == partId
                                    && x.Status == "Unconsumed" && x.DeletedBy == null)
                                    .ToListAsync();

        if (serialsToDelete == null)
        {
            return NotFound();
        }

        spaceLinxContext.KitSerials.RemoveRange(serialsToDelete);

        foreach (var newSerial in kitSerialAndComments.SerialNumbers)
        {
            var serial = mapper.Map<KitSerial>(newSerial);
            serial.KitId = kitId;
            serial.PartId = partId;
            serial.CreatedBy = UserEmail;
            serial.IsActive = true;
            spaceLinxContext.KitSerials.Add(serial);
        }

        var kitComments = await spaceLinxContext.KitBomComments
                                .FirstOrDefaultAsync(x => x.KitId == kitId && x.PartId == partId && x.DeletedBy == null);

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {

            if (kitComments == null)
            {
                kitComments = new KitBomComment
                {
                    KitId = kitId,
                    PartId = partId,
                    Comments = kitSerialAndComments.Comments,
                    CreatedBy = UserEmail,
                    IsActive = true
                };

                spaceLinxContext.KitBomComments.Add(kitComments);
            }
            else
            {
                kitComments.Comments = kitSerialAndComments.Comments;
                kitComments.UpdatedBy = UserEmail;
                kitComments.UpdatedAt = DateTime.UtcNow;
            }

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

    [HttpPut("status/consumed/{serialId}")]
    public async Task<IActionResult> UpdateStatus(Guid serialId)
    {
        await UpdateConsumedStatus(serialId);

        return NoContent();
    }

    [HttpPut("status/consumed")]
    public async Task<IActionResult> UpdateConsumedStatus(List<Guid> serialIds)
    {
        foreach (var serialId in serialIds)
        {
            await UpdateConsumedStatus(serialId);
        }

        return NoContent();
    }

    private async Task UpdateConsumedStatus(Guid serialId)
    {
        var recordFromDatabase = await spaceLinxContext.KitSerials.FindAsync(serialId);
        if (recordFromDatabase == null)
        {
            return;
        }
    
        recordFromDatabase.Status = "Consumed";
        recordFromDatabase.UpdatedBy = UserEmail;
        recordFromDatabase.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
    }
}