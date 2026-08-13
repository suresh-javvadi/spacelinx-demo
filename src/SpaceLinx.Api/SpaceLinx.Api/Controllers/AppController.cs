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
public class AppController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<App, AppWriteModel, AppUpdateModel, AppReadModel, AppRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("app-name")]
    public async Task<IActionResult> GetUsersByAppName()
    {
        var users = await spaceLinxContext.Users.AsNoTracking()
                           .Include(x => x.UserRoles.Where(ur => ur.Role.App.AppName == AppName && ur.DeletedBy == null))
                           .ThenInclude(x => x.Role)
                           .Where(x => x.UserRoles.Any(ur => ur.Role.App.AppName == AppName && ur.DeletedBy == null))
                           .ToListAsync();

        return Ok(userService.UserDetails(mapper, users));
    }
}