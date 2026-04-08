namespace SpaceLinx.Model;

public partial class EmailLogRefModel : BaseRefModel
{
    public string TemplateCode { get; set; } = null!;
    public string RecipientEmail { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? SentAt { get; set; }
}
