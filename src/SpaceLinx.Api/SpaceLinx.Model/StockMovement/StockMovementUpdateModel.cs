namespace SpaceLinx.Model;

public partial class StockMovementUpdateModel : BaseUpdateModel
{
    public string MovementType { get; set; } = null!;
    public string? MovementReason { get; set; }
    public DateOnly MovementDate { get; set; }
    public Guid? FromLocationId { get; set; }
    public Guid? FromBinId { get; set; }
    public Guid? ToLocationId { get; set; }
    public Guid? ToBinId { get; set; }
    public Guid? PerformedById { get; set; }
    public Guid? WorkOrderId { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = null!;
    public DateOnly? ExpectedReturnDate { get; set; }
    public DateOnly? ProjectDate { get; set; }
    public Guid? ProjectId { get; set; }
    public string? Department { get; set; }
    public Guid? AssignedUserId { get; set; }
    public string? IssuePurpose { get; set; }
    public Guid? CompanyId { get; set; }
}
