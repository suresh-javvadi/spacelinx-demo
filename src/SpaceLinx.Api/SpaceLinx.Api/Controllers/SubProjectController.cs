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
public class SubProjectController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<SubProject, SubProjectWriteModel, SubProjectUpdateModel, SubProjectReadModel, SubProjectRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    // Dependent lookup: active sub-projects for a given parent project (powers the cascading dropdown).
    [HttpGet("ByProject/{projectId}")]
    public async Task<ActionResult<List<SubProjectRefModel>>> GetByProject(Guid projectId)
    {
        var records = await spaceLinxContext.Set<SubProject>()
            .AsNoTracking()
            .Where(x => x.ProjectId == projectId && x.DeletedAt == null && x.IsActive == true)
            .ToListAsync();

        return mapper.Map<List<SubProjectRefModel>>(records);
    }
}
