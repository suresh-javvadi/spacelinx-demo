using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class ApprovalNotificationRecipientWriteModel : BaseWriteModel
{
    [Required]
    [MaxLength(50)]
    public string EntityType { get; set; } = null!;

    [Required]
    public Guid EntityId { get; set; }

    [Required]
    public Guid RecipientUserId { get; set; }

    [MaxLength(50)]
    public string? RecipientType { get; set; }
}
