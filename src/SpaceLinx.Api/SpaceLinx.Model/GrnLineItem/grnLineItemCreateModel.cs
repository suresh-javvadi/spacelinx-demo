namespace SpaceLinx.Model;

public class GrnLineItemCreateModel : BaseWriteModel
{
    public Guid PartId { get; set; }
    public Guid? PoLineItemId { get; set; }
    public int? ReceivedQuantity { get; set; }
    public string? TrackingMethod { get; set; }
    public string? TrackingId { get; set; }
    public DateOnly? ManufacturingDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public string? Remark { get; set; }
}
