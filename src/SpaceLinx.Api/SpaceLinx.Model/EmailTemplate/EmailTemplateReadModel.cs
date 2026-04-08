namespace SpaceLinx.Model;

public partial class EmailTemplateReadModel : BaseReadModel
{
    public string TemplateCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsHtml { get; set; }
}
