namespace SpaceLinx.Model;

public partial class ScrapLineItemRefModel : BaseRefModel
{
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public int ScrapQuantity { get; set; }
    public string? Reason { get; set; }
}