namespace SpaceLinx.Model;

public partial class GrnLineItemRefModel : BaseRefModel
{
    public Guid GrnId { get; set; }
    public Guid PartId { get; set; }
    public int? ReceivedQuantity { get; set; }
    public string TrackingMethod { get; set; } = null!;
    public string? TrackingId { get; set; }
    public string? QcStatus { get; set; }
    public Guid? CheckedById { get; set; }
}