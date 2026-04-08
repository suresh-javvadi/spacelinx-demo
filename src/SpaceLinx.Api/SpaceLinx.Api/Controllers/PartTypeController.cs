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
public class PartTypeController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<PartType, PartTypeWriteModel, PartTypeUpdateModel, PartTypeReadModel, PartTypeRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("Lookup")]
    public override async Task<List<PartTypeRefModel>> GetForLookup()
    {
        var records = await spaceLinxContext.PartTypes
            .AsNoTracking()
            .Where(x => x.DeletedBy == null && x.IsVisibleInUi == true)
            .ToListAsync();

        return mapper.Map<List<PartTypeRefModel>>(records);
    }

    [HttpPut("{id}/ActivateIsVisibleUi")]
    public virtual async Task<IActionResult> ActivateIsVisibleUi(Guid id)
    {
        var record = await spaceLinxContext.PartTypes
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound("Record not found.");
        }

        record.IsVisibleInUi = true;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }
        
    [HttpPut("{id}/DeActivateIsVisibleUi")]
    public virtual async Task<IActionResult> DeActivateIsVisibleUi(Guid id)
    {
        var record = await spaceLinxContext.PartTypes
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound("Record not found.");
        }

        record.IsVisibleInUi = false;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }
}
