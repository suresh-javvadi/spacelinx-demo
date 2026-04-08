namespace SpaceLinx.Model;

public partial class VendorReturnLineItem : BaseModel
{
    public Guid ReturnRequestId { get; set; }
    public Guid PartId { get; set; }
    public Guid? GrnLineItemId { get; set; }
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public int? ReturnQuantity { get; set; }
    public string? Reason { get; set; }
    public virtual GrnLineItem? GrnLineItem { get; set; }
    public virtual Part Part { get; set; } = null!;
    public virtual VendorReturnRequest ReturnRequest { get; set; } = null!;
}