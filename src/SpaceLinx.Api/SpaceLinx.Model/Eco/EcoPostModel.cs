namespace SpaceLinx.Model;

public partial class EcoPostModel : BaseWriteModel
{
    public string Name { get; set; } = null!;
    public string ReasonForChange { get; set; } = null!;
    public string? Description { get; set; }
    public string ChangeType { get; set; } = null!;
    public string? ImpactAnalysis { get; set; }
    public string Priority { get; set; } = null!;
    public string? Approver { get; set; }
    public List<ApprovalWriteModel> Approvals { get; set; } = new List<ApprovalWriteModel>();
    public List<EcoPartWriteModel> EcoParts { get; set; } = new List<EcoPartWriteModel>();
}