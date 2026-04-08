namespace SpaceLinx.Model;

public partial class VendorReturnLineItemRefModel : BaseRefModel
{
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public int? ReturnQuantity { get; set; }
    public string? Reason { get; set; }
}