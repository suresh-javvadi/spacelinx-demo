using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using System.Xml.Linq;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class EcoPartController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IPartService partService, IEcoPartService ecoPartService) :
    GenericRestController<EcoPart, EcoPartWriteModel, EcoPartUpdateModel, EcoPartReadModel, EcoPartRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpPost("create-eco-part/{ecoEntityId}")]
    public async Task<ActionResult<EcoPartReadModel>> CreateEcoPart(Guid ecoEntityId, EcoPartWriteModel ecoPart)
    {
        var ecoRecord = await spaceLinxContext.Ecos.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == ecoEntityId && x.DeletedBy == null);

        if(ecoRecord == null)
        {
            return NotFound();
        }

        if (ecoRecord.Status != "Draft")
        {
            throw new ApplicationException("EcoPart can only be added if the Eco status is in Draft.");
        }

        var newEcoPart = await ecoPartService.CreateEcoPart(ecoEntityId, ecoPart);

        return mapper.Map<EcoPartReadModel>(newEcoPart);
    }

    [HttpPost("create-eco-parts/{ecoEntityId}")]
    public async Task<ActionResult<EcoReadModel>> CreateEcoParts(Guid ecoEntityId, List<EcoPartWriteModel> ecoParts)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var ecoRecord = await spaceLinxContext.Ecos.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == ecoEntityId && x.DeletedBy == null);

            if (ecoRecord == null)
            {
                return NotFound();
            }

            if (ecoRecord.Status != "Draft")
            {
                throw new ApplicationException("EcoPart can only be added if the Eco status is in Draft.");
            }

            foreach (var ecoPart in ecoParts)
            {
                var newEcoPart = await ecoPartService.CreateEcoPart(ecoEntityId, ecoPart);
            }

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            var ecoLatestRecord = await spaceLinxContext.Ecos.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == ecoEntityId && x.DeletedBy == null);
            return mapper.Map<EcoReadModel>(ecoLatestRecord);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("update-eco-part/{ecoEntityId}")]
    public async Task<IActionResult> UpdateEcoPart(Guid ecoPartId, EcoPartUpdateModel updatedRecord)
    {
        var ecoPartRecord = await spaceLinxContext.EcoParts.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == updatedRecord.Id && x.DeletedBy == null);

        if(ecoPartRecord == null)
        {
            return NotFound();
        }

        ecoPartRecord.Status = updatedRecord.Status;
        ecoPartRecord.Description = updatedRecord.Description;
        ecoPartRecord.UpdatedAt = DateTime.UtcNow;
        ecoPartRecord.UpdatedBy = UserEmail;

        await spaceLinxContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{ecoPartId}")]
    public override async Task<IActionResult> Delete(Guid ecoPartId)
    {
        var ecoPartRecord = await GetAsync(ecoPartId);

        if (ecoPartRecord == null)
        {
            return NotFound();
        }

        var ecoRecord = await spaceLinxContext.Ecos.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == ecoPartRecord.EcoId);

        if (ecoRecord == null)
        {
            return NotFound();
        }
        else if (ecoRecord.Status != "Draft")
        {
            throw new ApplicationException("Eco must be in Draft status to Delete");
        }

        await RemoveAsync(ecoPartId);

        return NoContent();
    }
}