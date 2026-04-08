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
public class MachineController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<Machine, MachineWriteModel, MachineUpdateModel, MachineReadModel, MachineRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("{id}")]
    public override async Task<ActionResult<MachineReadModel>> Get(Guid id)
    {
        var record = await spaceLinxContext.Machines.AsNoTracking()
                   .Include(x => x.MachineType)
                   .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        return Ok(record);
    }
}
