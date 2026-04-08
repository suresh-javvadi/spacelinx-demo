using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class EmailTemplateController(
    SpaceLinxContext spaceLinxContext,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    IEmailTemplateService emailTemplateService) :
    GenericRestController<EmailTemplate, EmailTemplateWriteModel, EmailTemplateUpdateModel, EmailTemplateReadModel, EmailTemplateRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    /// <summary>
    /// Get a template by its unique template code.
    /// </summary>
    /// <param name="templateCode">The unique template code</param>
    /// <returns>The email template if found</returns>
    [HttpGet("ByCode/{templateCode}")]
    public async Task<ActionResult<EmailTemplateReadModel>> GetByCode(string templateCode)
    {
        var template = await emailTemplateService.GetTemplateByCodeAsync(templateCode);
        if (template == null)
        {
            return NotFound();
        }

        return mapper.Map<EmailTemplateReadModel>(template);
    }

    /// <summary>
    /// Render a template with placeholder values for preview.
    /// </summary>
    /// <param name="templateCode">The unique template code</param>
    /// <param name="placeholders">Dictionary of placeholder key-value pairs</param>
    /// <returns>The rendered email with subject and body</returns>
    [HttpPost("Render/{templateCode}")]
    public async Task<ActionResult<RenderedEmail>> RenderTemplate(
        string templateCode,
        [FromBody] Dictionary<string, string> placeholders)
    {
        var rendered = await emailTemplateService.RenderTemplateAsync(templateCode, placeholders);
        if (rendered == null)
        {
            return NotFound($"Template with code '{templateCode}' not found.");
        }

        return rendered;
    }
}
