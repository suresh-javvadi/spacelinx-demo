namespace SpaceLinx.Model;

public partial class IssueHistoryVw
{
    public Guid StockMovementLineItemId { get; set; }
    public Guid PartId { get; set; }
    public string? MovementNumber { get; set; }
    public DateOnly IssuedDate { get; set; }
    public string? Department { get; set; }
    public string? ResponsiblePerson { get; set; }
    public int IssuedQuantity { get; set; }
    public string? IssuedBin { get; set; }
    public string? ProjectName { get; set; }
    public string? MovementType { get; set; }
    public string? CreatedBy { get; set; }
    public string? TrackingId { get; set; }
}
