namespace SpaceLinx.Model;

public class GrnWithLineItemWriteModel
{
    public Guid? PurchaseOrderId { get; set; }
    public DateOnly ReceivedDate { get; set; }
    public Guid? ReceivedById { get; set; }
    public string? Notes { get; set; }
    public Guid? VendorReferenceId { get; set; }
    public Guid LocationId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? InvoiceNumber { get; set; }
    public DateOnly? InvoiceDate { get; set; }
    public Guid? VendorId { get; set; }
    public List<GrnLineItemCreateModel>? LineItems { get; set; }
    public List<DocumentCreateModel>? DocumentFiles { get; set; }
}