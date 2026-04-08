namespace SpaceLinx.Model;

public partial class StockMovementReadModel : BaseReadModel
{
    public string MovementNumber { get; set; } = null!;
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
    public virtual ProjectRefModel? Project { get; set; }
    public virtual UserRefModel? AssignedUser { get; set; }
    public virtual LocationRefModel? FromLocation { get; set; }
    public virtual LocationRefModel? ToLocation { get; set; }
    public virtual BinManagementRefModel? FromBin { get; set; }
    public virtual BinManagementRefModel? ToBin { get; set; }
    public virtual UserRefModel? PerformedBy { get; set; }
    public virtual WorkOrderRefModel? WorkOrder { get; set; }
}
