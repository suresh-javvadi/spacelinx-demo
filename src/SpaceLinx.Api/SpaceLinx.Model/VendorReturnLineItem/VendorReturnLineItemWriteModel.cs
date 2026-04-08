namespace SpaceLinx.Model;

public partial class VendorReturnLineItemWriteModel : BaseWriteModel
{
    public Guid ReturnRequestId { get; set; }
    public Guid PartId { get; set; }
    public Guid? GrnLineItemId { get; set; }
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public int? ReturnQuantity { get; set; }
    public string? Reason { get; set; }
}