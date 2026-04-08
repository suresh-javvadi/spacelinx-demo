namespace SpaceLinx.Model;

public class EcoAlterModel : BaseUpdateModel
{
    public string Name { get; set; } = null!;
    public string ReasonForChange { get; set; } = null!;
    public string? Description { get; set; }
    public string ChangeType { get; set; } = null!;
    public string? ImpactAnalysis { get; set; }
    public string Priority { get; set; } = null!;
    public DateTime? PlannedImplementationDate { get; set; }
    public List<ApprovalWriteModel> Approvals { get; set; } = new List<ApprovalWriteModel>();
}