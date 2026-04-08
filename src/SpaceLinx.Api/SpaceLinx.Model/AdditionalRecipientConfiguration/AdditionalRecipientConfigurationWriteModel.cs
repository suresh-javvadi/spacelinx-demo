using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class AdditionalRecipientConfigurationWriteModel : BaseWriteModel
{
    [Required]
    [MaxLength(100)]
    public string TemplateCode { get; set; } = null!;

    [Required]
    [MaxLength(255)]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [MaxLength(255)]
    public string? RecipientName { get; set; }

    [MaxLength(50)]
    public string? RecipientType { get; set; }
}
