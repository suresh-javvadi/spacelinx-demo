using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserUaController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService)
    : BaseController(spaceLinxContext, httpContextAccessor)
{
    //obselete
    [AllowAnonymous]
    [HttpGet("ua/checkuser/{email}")]
    public async Task<IActionResult> CheckUserByEmail(string email)
    {
        var user = await spaceLinxContext.Users.AsNoTracking()
                    .Include(x => x.UserRoles.Where(ur => ur.Role.App.AppName == AppName && ur.DeletedBy == null))
                    .ThenInclude(x => x.Role)
                    .FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower() && x.DeletedBy == null);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [AllowAnonymous]
    [HttpGet("ua/checkuserroles/{email}")]
    public async Task<IActionResult> CheckUsersByEmailWithRoles(string email)
    {
        var user = await spaceLinxContext.Users.AsNoTracking()
                        .Include(x => x.UserRoles.Where(ur => ur.Role.App.AppName == AppName && ur.DeletedBy == null))
                        .ThenInclude(x => x.Role)
                    .FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower() && x.DeletedBy == null);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(userService.UserDetail(mapper, user));
    }
}