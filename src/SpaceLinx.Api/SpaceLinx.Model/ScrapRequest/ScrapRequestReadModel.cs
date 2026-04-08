namespace SpaceLinx.Model;

public partial class ScrapRequestReadModel : BaseReadModel
{
    public string ScrapNumber { get; set; } = null!;
    public Guid? LocationId { get; set; }
    public Guid? RaisedById { get; set; }
    public DateOnly? ScrapDate { get; set; }
    public string? Reason { get; set; }
    public Guid? PoId { get; set; }
    public Guid? GrnId { get; set; }
    public Guid? WoId { get; set; }
    public string Status { get; set; } = null!;
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedDate { get; set; }
    public virtual GoodsReceiptNote? Grn { get; set; }
    public virtual Location? Location { get; set; }
    public virtual PurchaseOrder? Po { get; set; }
    public virtual User? RaisedBy { get; set; }
    public virtual WorkOrder? Wo { get; set; }
}