namespace SpaceLinx.Model;

public partial class Eco : BaseModel
{
    public string Number { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string ReasonForChange { get; set; } = null!;
    public string? Description { get; set; }
    public string ChangeType { get; set; } = null!;
    public string? ImpactAnalysis { get; set; }
    public string Priority { get; set; } = null!;
    public string Requestor { get; set; } = null!;
    public string? Approver { get; set; }
    public DateTime? PlannedImplementationDate { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string Status { get; set; } = null!;
    public virtual ICollection<EcoLog> EcoLogs { get; set; } = new List<EcoLog>();
    public virtual ICollection<EcoPart> EcoParts { get; set; } = new List<EcoPart>();
    public virtual ICollection<Part> Parts { get; set; } = new List<Part>();
}