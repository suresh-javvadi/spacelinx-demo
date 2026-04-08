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
public class RolePermissionController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<RolePermission, RolePermissionWriteModel, RolePermissionUpdateModel, RolePermissionReadModel, RolePermissionRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("role/{roleId}")]
    public async Task<List<RolePermissionReadModel>> GetByRoleId(Guid roleId)
    {
        var records = await spaceLinxContext.RolePermissions
            .AsNoTracking()
            .Where(x => x.RoleId == roleId && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<RolePermissionReadModel>>(records);
    }

    [HttpGet("role-name")]
    public async Task<List<RolePermissionReadModel>> GetByRoleName(string roleName)
    {
        var records = await spaceLinxContext.RolePermissions
            .AsNoTracking()
            .Include(x => x.Role)
            .Where(x => x.Role.RoleName == roleName && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<RolePermissionReadModel>>(records);
    }
}