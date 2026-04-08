namespace SpaceLinx.Model;

public partial class PurchaseHistoryVw
{
    public Guid GrnLineItemId { get; set; }
    public Guid PartId { get; set; }
    public string? GrnNumber { get; set; }
    public string? PoNumber { get; set; }
    public DateOnly ReceivedDate { get; set; }
    public int? ReceivedQuantity { get; set; }
    public string? VendorName { get; set; }
    public string? ProjectName { get; set; }
    public string? ReceivedBy { get; set; }
    public string? TrackingId { get; set; }
    public string? CreatedBy { get; set; }
}