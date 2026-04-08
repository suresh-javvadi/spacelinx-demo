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
public class EmailLogController(SpaceLinxContext spaceLinxContext) : ControllerBase
{
    [HttpGet("email-logs")]
    public async Task<IActionResult> GetEmailLogs()
    {
        var logs = await spaceLinxContext.EmailLogs
            .AsNoTracking()
            .Where(x => x.DeletedBy == null)
            .ToListAsync();

        return Ok(logs);
    }
}
