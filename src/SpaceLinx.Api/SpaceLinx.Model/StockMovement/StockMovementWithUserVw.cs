namespace SpaceLinx.Model;

public partial class StockMovementWithUserVw
{
    public Guid? StockMovementId { get; set; }
    public string? MovementNumber { get; set; }
    public string? MovementType { get; set; }
    public string? Status { get; set; }
    public string? MovementReason { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
    public DateOnly? MovementDate { get; set; }
    public DateOnly? ExpectedReturnDate { get; set; }
    public DateOnly? ProjectDate { get; set; }
    public Guid? FromLocationId { get; set; }
    public string? FromLocationNumber { get; set; }
    public string? FromLocationName { get; set; }
    public Guid? ToLocationId { get; set; }
    public string? ToLocationNumber { get; set; }
    public string? ToLocationName { get; set; }
    public Guid? FromBinId { get; set; }
    public string? FromBinCode { get; set; }
    public string? FromBinAisle { get; set; }
    public string? FromBinRack { get; set; }
    public Guid? ToBinId { get; set; }
    public string? ToBinCode { get; set; }
    public string? ToBinAisle { get; set; }
    public string? ToBinRack { get; set; }
    public Guid? WorkOrderId { get; set; }
    public string? WorkOrderNumber { get; set; }
    public Guid? PerformedById { get; set; }
    public string? PerformedByFullName { get; set; }
    public string? PerformedByEmail { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
