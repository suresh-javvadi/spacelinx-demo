namespace SpaceLinx.Model;

public partial class Approval : BaseModel
{
    public string EntityType { get; set; } = null!;
    public Guid EntityId { get; set; }
    public int StageNumber { get; set; }
    public Guid ApproverId { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? ActedAt { get; set; }
    public string? Comment { get; set; }
    public virtual User Approver { get; set; } = null!;
}