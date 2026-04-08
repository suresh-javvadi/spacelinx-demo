namespace SpaceLinx.Model;

public partial class AdditionalRecipientConfigurationReadModel : BaseReadModel
{
    public string TemplateCode { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? RecipientName { get; set; }
    public string? RecipientType { get; set; }
}
