namespace SpaceLinx.Model;

public partial class StockMovementRefModel : BaseRefModel
{
    public string MovementNumber { get; set; } = null!;
    public string MovementType { get; set; } = null!;
    public string? MovementReason { get; set; }
    public DateOnly MovementDate { get; set; }
    public string Status { get; set; } = null!; 
    public DateOnly? ExpectedReturnDate { get; set; }
    public DateOnly? ProjectDate { get; set; }
    public Guid? ProjectId { get; set; }
    public string? Department { get; set; }
}
