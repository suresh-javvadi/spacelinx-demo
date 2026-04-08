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
public class UserRoleController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<UserRole, UserRoleWriteModel, UserRoleUpdateModel, UserRoleReadModel, UserRoleRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("role/{id}")]
    public async Task<List<UserRoleReadModel>> GetByRole(Guid id)
    {
        var userRoles = await spaceLinxContext.UserRoles
            .AsNoTracking()
            .Include(ur => ur.Role)
            .Where(ur => ur.RoleId == id && ur.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<UserRoleReadModel>>(userRoles);
    }

    [HttpGet("role-name")]
    public async Task<List<UserRoleReadModel>> GetByRoleName(string roleName)
    {
        var userRoles = await spaceLinxContext.UserRoles
            .AsNoTracking()
            .Include(ur => ur.Role)
            .Where(ur => ur.Role.RoleName == roleName && ur.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<UserRoleReadModel>>(userRoles);
    }

    [HttpPut("set-is-default/{userId}/{roleId}")]
    public async Task<IActionResult> SetIsDefault(Guid userId, Guid roleId)
    {
        var record = await spaceLinxContext.UserRoles
            .AsNoTracking()
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == roleId && ur.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                           "call application.set_default_role({0}, {1}, {2})",
                           record.UserId,
                           record.RoleId,
                           UserEmail
                       );

        return NoContent();
    }
}
