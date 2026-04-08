namespace SpaceLinx.Model;

public partial class ApprovalRefModel : BaseRefModel
{
    public string EntityType { get; set; } = null!;
    public Guid EntityId { get; set; }
    public int StageNumber { get; set; }
    public Guid ApproverId { get; set; }
}