namespace SpaceLinx.Model;

public partial class ApprovalWriteModel : BaseWriteModel
{
    public int StageNumber { get; set; }
    public Guid ApproverId { get; set; }
    public DateTime? ActedAt { get; set; }
    public string? Comment { get; set; }
}