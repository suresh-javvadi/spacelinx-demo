using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class ApprovalLogWriteModel : BaseWriteModel
{
    [Required]
    [MaxLength(50)]
    public string EntityType { get; set; } = null!;

    [Required]
    public Guid EntityId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Action { get; set; } = null!;

    [Required]
    public DateTime ActionAt { get; set; }

    [Required]
    [MaxLength(256)]
    public string ActionBy { get; set; } = null!;

    public int? StageNumber { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }

    [MaxLength(50)]
    public string? PreviousStatus { get; set; }

    [MaxLength(50)]
    public string? NewStatus { get; set; }
}
