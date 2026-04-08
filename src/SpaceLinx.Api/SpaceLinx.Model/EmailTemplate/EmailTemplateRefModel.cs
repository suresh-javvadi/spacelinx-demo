namespace SpaceLinx.Model;

public partial class EmailTemplateRefModel : BaseRefModel
{
    public string TemplateCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public bool IsHtml { get; set; }
}
