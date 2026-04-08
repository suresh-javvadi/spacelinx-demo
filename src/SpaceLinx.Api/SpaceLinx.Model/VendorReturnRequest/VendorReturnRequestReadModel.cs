namespace SpaceLinx.Model;

public partial class VendorReturnRequestReadModel : BaseReadModel
{
    public Guid VendorId { get; set; }
    public Guid? PoId { get; set; }
    public Guid? GrnId { get; set; }
    public Guid? WoId { get; set; }
    public DateOnly? ReturnDate { get; set; }
    public Guid? RaisedById { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = null!;
    public Guid? LocationId { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedDate { get; set; }
    public virtual GoodsReceiptNote? Grn { get; set; }
    public virtual Location? Location { get; set; }
    public virtual PurchaseOrder? Po { get; set; }
    public virtual User? RaisedBy { get; set; }
    public virtual Company Vendor { get; set; } = null!;
    public virtual WorkOrder? Wo { get; set; }
}