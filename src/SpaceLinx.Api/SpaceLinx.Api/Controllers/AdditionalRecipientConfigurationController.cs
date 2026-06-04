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
public class AdditionalRecipientConfigurationController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<AdditionalRecipientConfiguration, AdditionalRecipientConfigurationWriteModel, AdditionalRecipientConfigurationUpdateModel, AdditionalRecipientConfigurationReadModel, AdditionalRecipientConfigurationRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("template/{templateCode}")]
    public async Task<IActionResult> GetByTemplateCode(string templateCode)
    {
        var recipients = await spaceLinxContext.AdditionalRecipientConfigurations
            .AsNoTracking()
            .Where(r => r.TemplateCode.ToUpper() == templateCode.ToUpper() && r.DeletedBy == null && r.IsActive == true)
            .ToListAsync();

        return Ok(mapper.Map<List<AdditionalRecipientConfigurationReadModel>>(recipients));
    }
}
