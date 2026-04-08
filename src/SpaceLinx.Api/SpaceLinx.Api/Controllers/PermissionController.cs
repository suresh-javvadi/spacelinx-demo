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
public class PermissionController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<Permission, PermissionWriteModel, PermissionUpdateModel, PermissionReadModel, PermissionRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpPut("permission-update/{id}")]
    public async Task<IActionResult> UpdatePermission(Guid id, string permissionName)
    {
        var permission = await spaceLinxContext.Permissions
            .FirstOrDefaultAsync(p => p.Id == id && p.DeletedBy == null);

        if (permission == null)
        {
            return NotFound($"Permission with ID {id} not found.");
        }

        var rolePermissions = await spaceLinxContext.RolePermissions
            .Where(x => x.Permission == permission.Name && x.DeletedBy == null)
            .ToListAsync();

        permission.Name = permissionName;
        permission.UpdatedAt = DateTime.UtcNow;
        permission.UpdatedBy = UserEmail;

        foreach (var rolePermission in rolePermissions)
        {
            rolePermission.Permission = permissionName;
            rolePermission.UpdatedBy = UserEmail;
            rolePermission.UpdatedAt = DateTime.UtcNow;
        }

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("permission-delete/{permissionName}")]
    public async Task<IActionResult> DeletePermission(string permissionName)
    {
        var permission = await spaceLinxContext.Permissions
            .FirstOrDefaultAsync(p => p.Name == permissionName);

        if (permission == null)
        {
            return NotFound($"Permission with Name {permissionName} not found.");
        }

        var rolePermissions = await spaceLinxContext.RolePermissions
            .Where(x => x.Permission == permission.Name && x.DeletedAt == null)
            .ToListAsync();

        permission.IsActive = false;
        permission.DeletedAt = DateTime.UtcNow;
        permission.DeletedBy = UserEmail;

        foreach (var rp in rolePermissions)
        {
            rp.IsActive = false;
            rp.DeletedAt = DateTime.UtcNow;
            rp.DeletedBy = UserEmail;
        }

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }
}