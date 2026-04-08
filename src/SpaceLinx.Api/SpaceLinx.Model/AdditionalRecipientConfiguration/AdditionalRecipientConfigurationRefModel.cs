namespace SpaceLinx.Model;

public partial class AdditionalRecipientConfigurationRefModel : BaseRefModel
{
    public string TemplateCode { get; set; } = null!;
    public string Email { get; set; } = null!;
}
