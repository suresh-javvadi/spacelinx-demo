using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

public class EmailTemplateService : IEmailTemplateService
{
    private readonly SpaceLinxContext _context;
    private readonly ILogger<EmailTemplateService> _logger;

    public EmailTemplateService(
        SpaceLinxContext context,
        ILogger<EmailTemplateService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<EmailTemplate?> GetTemplateByCodeAsync(string templateCode)
    {
        return await _context.EmailTemplates
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.TemplateCode == templateCode &&
                                      t.IsActive == true &&
                                      t.DeletedBy == null);
    }

    public async Task<RenderedEmail?> RenderTemplateAsync(
        string templateCode,
        Dictionary<string, string> placeholders)
    {
        var template = await GetTemplateByCodeAsync(templateCode);
        if (template == null)
        {
            _logger.LogWarning("Email template not found: {TemplateCode}", templateCode);
            return null;
        }

        var subject = ReplacePlaceholders(template.Subject, placeholders);
        var body = ReplacePlaceholders(template.Body, placeholders);

        return new RenderedEmail(subject, body, template.IsHtml ?? true);
    }

    public async Task<List<EmailTemplate>> GetAllTemplatesAsync()
    {
        return await _context.EmailTemplates
            .AsNoTracking()
            .Where(t => t.IsActive == true && t.DeletedBy == null)
            .ToListAsync();
    }

    public async Task<EmailTemplate?> UpdateTemplateAsync(
        Guid templateId,
        EmailTemplateUpdateModel model)
    {
        var template = await _context.EmailTemplates
            .FirstOrDefaultAsync(t => t.Id == templateId && t.DeletedBy == null);

        if (template == null) return null;

        if (model.Name != null) template.Name = model.Name;
        if (model.Subject != null) template.Subject = model.Subject;
        if (model.Body != null) template.Body = model.Body;
        if (model.Description != null) template.Description = model.Description;
        if (model.IsHtml.HasValue) template.IsHtml = model.IsHtml.Value;
        template.UpdatedAt = DateTime.UtcNow;
        template.UpdatedBy = model.UpdatedBy;

        await _context.SaveChangesAsync();
        return template;
    }

    private static string ReplacePlaceholders(string template, Dictionary<string, string> placeholders)
    {
        var result = template;
        foreach (var placeholder in placeholders)
        {
            result = result.Replace($"{{{{{placeholder.Key}}}}}", placeholder.Value);
        }
        return result;
    }
}
