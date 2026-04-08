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
public class RoleFilterController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<RoleFilter, RoleFilterWriteModel, RoleFilterUpdateModel, RoleFilterReadModel, RoleFilterRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-role/{roleId}")]
    public async Task<List<RoleFilterReadModel>> GetByRole(Guid roleId)
    {
        var roleFilters = await spaceLinxContext.RoleFilters
            .AsNoTracking()
            .Where(r => r.RoleId == roleId && r.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<RoleFilterReadModel>>(roleFilters);
    }

    [HttpGet("by-role-name/{roleName}")]
    public async Task<List<RoleFilterReadModel>> GetByRoleName(string roleName)
    {
        var roleFilters = await spaceLinxContext.RoleFilters
            .AsNoTracking()
            .Where(r => r.Role.RoleName == roleName && r.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<RoleFilterReadModel>>(roleFilters);
    }
}