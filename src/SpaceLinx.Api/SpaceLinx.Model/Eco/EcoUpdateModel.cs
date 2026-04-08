namespace SpaceLinx.Model;

public partial class EcoUpdateModel : BaseUpdateModel
{
    public string Name { get; set; } = null!;
    public string ReasonForChange { get; set; } = null!;
    public string? Description { get; set; }
    public string ChangeType { get; set; } = null!;
    public string? ImpactAnalysis { get; set; }
    public string Priority { get; set; } = null!;
    public string? Approver { get; set; }
    public DateTime? PlannedImplementationDate { get; set; }
}