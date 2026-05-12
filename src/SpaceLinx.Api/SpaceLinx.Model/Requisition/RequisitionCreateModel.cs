namespace SpaceLinx.Model;

public partial class RequisitionCreateModel 
{
    public Guid RequestedById { get; set; }
    public DateOnly RequestDate { get; set; }
    public string? Title { get; set; }
    public Guid? ProjectId { get; set; }
    public DateOnly? RequiredByDate { get; set; }
    public string? Justification { get; set; }
    public string Priority { get; set; } = null!;
    public decimal TotalEstimatedAmount { get; set; }
    public Guid? DepartmentId { get; set; }
    public List<RequisitionLineItemCreateModel>? LineItems { get; set; }
}