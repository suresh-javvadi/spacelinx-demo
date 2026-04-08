namespace SpaceLinx.Model;

public partial class GrnLineItemWriteModel : BaseWriteModel
{
    public Guid GrnId { get; set; }
    public Guid PartId { get; set; }
    public int? ReceivedQuantity { get; set; }
    public string TrackingMethod { get; set; } = null!;
    public string? TrackingId { get; set; }
    public DateOnly? ManufacturingDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public string? Remark { get; set; }
}