namespace SpaceLinx.Model;

public partial class GoodsReceiptNoteDetailsReadModel : BaseReadModel
{
    public string GrnNumber { get; set; } = null!;
    public Guid? PurchaseOrderId { get; set; }
    public DateOnly ReceivedDate { get; set; }
    public Guid? ReceivedById { get; set; }
    public string? Description { get; set; }
    public Guid? VendorReferenceId { get; set; }
    public Guid LocationId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateOnly? InvoiceDate { get; set; }
    public string Status { get; set; } = null!;
    public Guid? VendorId { get; set; }
    public virtual ICollection<GrnLineItemDetailReadModel> GrnLineItems { get; set; } = new List<GrnLineItemDetailReadModel>();
}