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
public class BinManagementController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<BinManagement, BinManagementWriteModel, BinManagementUpdateModel, BinManagementReadModel, BinManagementRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("location/{locationId}")]
    public async Task<ActionResult<List<BinManagementReadModel>>> GetByLocationId(Guid locationId)
    {
        var records = await spaceLinxContext.BinManagements
            .AsNoTracking()
            .Where(x => x.LocationId == locationId && x.DeletedBy == null)
            .ToListAsync();

        if (records == null)
        {
            return NotFound();
        }

        return mapper.Map<List<BinManagementReadModel>>(records);
    }
}