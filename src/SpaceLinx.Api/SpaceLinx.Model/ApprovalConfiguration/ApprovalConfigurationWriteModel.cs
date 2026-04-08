using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class ApprovalConfigurationWriteModel : BaseWriteModel
{
    [Required]
    [MaxLength(50)]
    public string EntityType { get; set; } = null!;

    [Required]
    [Range(1, 10)]
    public int NumberOfLevels { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool RequireSequentialApproval { get; set; } = true;
}
