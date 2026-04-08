namespace SpaceLinx.Model;

public partial class ScrapRequestWithUserVw
{
    public Guid? ScrapRequestId { get; set; }
    public string? ScrapNumber { get; set; }
    public DateOnly? ScrapDate { get; set; }
    public string? ScrapReason { get; set; }
    public string? ScrapStatus { get; set; }
    public string? RaisedByFullName { get; set; }
    public string? RaisedByEmail { get; set; }
    public Guid? LocationId { get; set; }
    public string? LocationNumber { get; set; }
    public string? LocationName { get; set; }
    public Guid? PoId { get; set; }
    public string? PoNumber { get; set; }
    public DateOnly? PoOrderDate { get; set; }
    public string? PoStatus { get; set; }
    public Guid? GrnId { get; set; }
    public string? GrnNumber { get; set; }
    public DateOnly? GrnReceivedDate { get; set; }
    public string? GrnStatus { get; set; }
    public Guid? WoId { get; set; }
    public string? WorkOrderNumber { get; set; }
    public string? WoStatus { get; set; }
    public Guid? LineItemId { get; set; }
    public Guid? PartId { get; set; }
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public int? ScrapQuantity { get; set; }
    public string? LineItemReason { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}