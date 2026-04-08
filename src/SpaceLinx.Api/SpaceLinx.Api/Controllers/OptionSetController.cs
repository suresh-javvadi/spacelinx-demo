using AutoMapper;
using SpaceLinx.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class OptionSetController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<OptionSet, OptionSetWriteModel, OptionSetUpdateModel, OptionSetReadModel, OptionSetRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("application-name")]
    public async Task<IActionResult> GetByApp()
    {
        var records = await spaceLinxContext.OptionSets
            .AsNoTracking()
            .Where(x => x.ApplicationName == AppName && x.DeletedBy == null)
            .ToListAsync();

        if (records == null || !records.Any())
        {
            return NotFound();
        }

        return Ok(records);
    }

    [HttpGet("name")]
    public async Task<IActionResult> GetByName(string name)
    {
        var record = await spaceLinxContext.OptionSets
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Name == name && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        return Ok(record);
    }
}