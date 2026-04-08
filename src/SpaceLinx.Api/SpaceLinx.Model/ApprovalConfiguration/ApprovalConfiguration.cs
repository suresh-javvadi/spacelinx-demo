namespace SpaceLinx.Model;

public partial class ApprovalConfiguration : BaseModel
{
    public string EntityType { get; set; } = null!;
    public int NumberOfLevels { get; set; }
    public string? Description { get; set; }
    public bool RequireSequentialApproval { get; set; }
}
