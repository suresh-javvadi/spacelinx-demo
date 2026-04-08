namespace SpaceLinx.Model;

public partial class GoodsReceiptNoteUpdateModel : BaseUpdateModel
{
    public Guid? PurchaseOrderId { get; set; }
    public DateOnly ReceivedDate { get; set; }
    public Guid? ReceivedById { get; set; }
    public string? Description { get; set; }
    public Guid? VendorReferenceId { get; set; }
    public Guid LocationId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateOnly? InvoiceDate { get; set; }
    public Guid? VendorId { get; set; }
}