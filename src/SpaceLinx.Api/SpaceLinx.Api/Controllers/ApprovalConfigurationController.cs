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
public class ApprovalConfigurationController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<ApprovalConfiguration, ApprovalConfigurationWriteModel, ApprovalConfigurationUpdateModel, ApprovalConfigurationReadModel, ApprovalConfigurationRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("entity/{entityType}")]
    public async Task<IActionResult> GetByEntityType(string entityType)
    {
        var config = await spaceLinxContext.ApprovalConfigurations
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.EntityType == entityType && c.DeletedBy == null && c.IsActive);

        if (config == null)
        {
            return NotFound($"No approval configuration found for entity type: {entityType}");
        }

        return Ok(mapper.Map<ApprovalConfigurationReadModel>(config));
    }
}
