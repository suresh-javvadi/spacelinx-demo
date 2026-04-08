namespace SpaceLinx.Model;

public partial class StockMovementLineItem : BaseModel
{
    public Guid StockMovementId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public string? Reason { get; set; }
    public string? Notes { get; set; }
    public string? AdjustmentType { get; set; }
    public virtual StockMovement StockMovement { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
}
