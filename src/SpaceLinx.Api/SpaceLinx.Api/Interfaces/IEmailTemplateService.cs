using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IEmailTemplateService
{
    /// <summary>
    /// Get a template by its code.
    /// </summary>
    Task<EmailTemplate?> GetTemplateByCodeAsync(string templateCode);

    /// <summary>
    /// Render a template with placeholder replacements.
    /// </summary>
    Task<RenderedEmail?> RenderTemplateAsync(
        string templateCode,
        Dictionary<string, string> placeholders);

    /// <summary>
    /// Get all available templates.
    /// </summary>
    Task<List<EmailTemplate>> GetAllTemplatesAsync();

    /// <summary>
    /// Update a template.
    /// </summary>
    Task<EmailTemplate?> UpdateTemplateAsync(Guid templateId, EmailTemplateUpdateModel model);
}

public record RenderedEmail(
    string Subject,
    string Body,
    bool IsHtml);
