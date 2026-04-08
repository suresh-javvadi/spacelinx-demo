namespace SpaceLinx.Model;
 
public partial class Requisition : BaseModel
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
    public virtual Project? Project { get; set; }
    public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    public virtual User RequestedBy { get; set; } = null!;
    public virtual ICollection<RequisitionLineItem> RequisitionLineItems { get; set; } = new List<RequisitionLineItem>();
}