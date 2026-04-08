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
public class RoleController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<Role, RoleWriteModel, RoleUpdateModel, RoleReadModel, RoleRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-application/{applicationId}")]
    public async Task<List<RoleReadModel>> GetBy(Guid applicationId)
    {
        var roles = await spaceLinxContext.Roles
            .AsNoTracking()
            .Where(r => r.AppId == applicationId && r.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<RoleReadModel>>(roles);
    }

    [HttpGet("by-application-name/{applicationName}")]
    public async Task<List<RoleReadModel>> GetByAppName(string applicationName)
    {
        var roles = await spaceLinxContext.Roles
            .AsNoTracking()
            .Where(r => r.App.AppName == applicationName && r.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<RoleReadModel>>(roles);
    }

    [HttpGet("users-by-role/{roleName}")]
    public async Task<IActionResult> GetUsersByRoleName(string roleName)
    {
        var users = await spaceLinxContext.UserRoles
            .AsNoTracking()
            .Include(ur => ur.User)
            .Include(ur => ur.Role)
            .Where(ur => ur.Role.RoleName == roleName && ur.DeletedBy == null)
            .Select(ur => ur.User)
            .ToListAsync();

        var Users = mapper.Map<List<UserReadModel>>(users);
        return Ok(Users);
    }

    [HttpPut("role-update/{id}")]
    public async Task<IActionResult> RoleAlter(RoleAlterModel updatedRecord, Guid id)
    {
        var appRecord = await spaceLinxContext.Apps.FirstOrDefaultAsync(x => x.AppName == AppName && x.DeletedBy == null);
        if (appRecord is null)
        {
            return NotFound();
        }
        
        var roleRecord = await spaceLinxContext.Roles
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);
        if (roleRecord is null)
        {
            return NotFound();
        }

        roleRecord.RoleDescription = updatedRecord.RoleDescription;
        roleRecord.SystemDefined = updatedRecord.SystemDefined;
        roleRecord.AppId = appRecord.Id ?? Guid.Empty;
        roleRecord.RoleName = updatedRecord.RoleName;
        roleRecord.UpdatedBy = UserEmail;
        roleRecord.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("create-role")]
    public async Task<IActionResult> RoleCreate(RoleCreateModel newRecord)
    {
        var appRecord = await spaceLinxContext.Apps.FirstOrDefaultAsync(x => x.AppName == AppName && x.DeletedBy == null);

        if (appRecord is null)
        {
            return NotFound();
        }

        var roleRecord = new RoleWriteModel
        {
            RoleName = newRecord.RoleName,
            AppId = appRecord.Id ?? Guid.Empty,
            RoleDescription = newRecord.RoleDescription,
            SystemDefined = newRecord.SystemDefined
        };

        var result = await CreateAsync(roleRecord);

        return CreatedAtAction(nameof(Get), new { id = result?.Id }, result);
    }
}
