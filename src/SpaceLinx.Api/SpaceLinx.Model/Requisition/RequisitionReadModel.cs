namespace SpaceLinx.Model;
 
public partial class RequisitionReadModel : BaseReadModel
{
    public string ReqNumber { get; set; } = null!;
    public Guid RequestedById { get; set; }
    public string? Title { get; set; }
    public Guid? ProjectId { get; set; }
    public DateOnly RequestDate { get; set; }
    public DateOnly? RequiredByDate { get; set; }
    public string? Justification { get; set; }
    public string Priority { get; set; } = null!;
    public string Status { get; set; } = null!;
    public decimal? TotalEstimatedAmount { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedDate { get; set; }
    public string? ApproverComment { get; set; }
    public Guid? DepartmentId { get; set; }
    public virtual DepartmentRefModel? Department { get; set; }
    public virtual ProjectRefModel? Project { get; set; }
    public virtual UserRefModel RequestedBy { get; set; } = null!;
}