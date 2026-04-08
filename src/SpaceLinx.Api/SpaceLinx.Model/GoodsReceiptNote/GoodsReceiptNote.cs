namespace SpaceLinx.Model;

public partial class GoodsReceiptNote : BaseModel
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
    public virtual Company? Vendor { get; set; }
    public virtual ICollection<GrnLineItem> GrnLineItems { get; set; } = new List<GrnLineItem>();
    public virtual PurchaseOrder? PurchaseOrder { get; set; }
    public virtual User ReceivedBy { get; set; } = null!;
    public virtual Document? VendorReference { get; set; }
    public virtual Location Location { get; set; } = null!;
    public virtual ICollection<ScrapRequest> ScrapRequests { get; set; } = new List<ScrapRequest>();
    public virtual ICollection<VendorReturnRequest> VendorReturnRequests { get; set; } = new List<VendorReturnRequest>();
}