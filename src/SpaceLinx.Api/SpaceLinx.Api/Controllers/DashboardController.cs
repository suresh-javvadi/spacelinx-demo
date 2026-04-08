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
public class DashboardController(SpaceLinxContext spaceLinxContext) : ControllerBase
{
    [HttpGet("MasterData-count")]
    public async Task<IActionResult> GetMasterDataCount()
    {
        var result = new
        {
            PartsCount = await spaceLinxContext.Parts.AsNoTracking().Where(p => p.DeletedBy == null).CountAsync(),
            ToolsCount = await spaceLinxContext.Tools.AsNoTracking().Where(t => t.DeletedBy == null).CountAsync(),
            MachinesCount = await spaceLinxContext.Machines.AsNoTracking().Where(m => m.DeletedBy == null).CountAsync(),
            NewsCount = await spaceLinxContext.News.AsNoTracking().Where(n => n.DeletedBy == null).CountAsync(),
            LocationCount = await spaceLinxContext.Locations.AsNoTracking().Where(l => l.DeletedBy == null).CountAsync()
        };

        return Ok(result);
    }
}