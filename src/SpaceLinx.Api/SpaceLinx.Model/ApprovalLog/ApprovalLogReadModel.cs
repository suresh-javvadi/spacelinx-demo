namespace SpaceLinx.Model;

public partial class ApprovalLogReadModel : BaseReadModel
{
    public string EntityType { get; set; } = null!;
    public Guid EntityId { get; set; }
    public string Action { get; set; } = null!;
    public DateTime ActionAt { get; set; }
    public string ActionBy { get; set; } = null!;
    public int? StageNumber { get; set; }
    public string? Notes { get; set; }
    public string? PreviousStatus { get; set; }
    public string? NewStatus { get; set; }
}
