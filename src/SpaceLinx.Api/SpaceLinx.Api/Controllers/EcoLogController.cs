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
public class EcoLogController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<EcoLog, EcoLogWriteModel, EcoLogUpdateModel, EcoLogReadModel, EcoLogRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("Eco/{ecoId}")]
    public async Task<ActionResult<List<EcoLogReadModel>>> GetByEcoId(Guid ecoId)
    {
        var logs = await spaceLinxContext.EcoLogs
            .AsNoTracking()
            .Where(log => log.EcoId == ecoId && log.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<EcoLogReadModel>>(logs);
    }
}