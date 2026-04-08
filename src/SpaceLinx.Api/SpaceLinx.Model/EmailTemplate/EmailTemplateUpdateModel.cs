namespace SpaceLinx.Model;

public partial class EmailTemplateUpdateModel : BaseUpdateModel
{
    public string? Name { get; set; }
    public string? Subject { get; set; }
    public string? Body { get; set; }
    public string? Description { get; set; }
    public bool? IsHtml { get; set; }
    public string? UpdatedBy { get; set; }
}
