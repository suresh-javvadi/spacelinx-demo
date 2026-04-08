namespace SpaceLinx.Model;

public partial class VendorReturnRequestWithUserVw
{
    public Guid? VendorReturnRequestId { get; set; }
    public string? ReturnNumber { get; set; }
    public DateOnly? ReturnDate { get; set; }
    public string? ReturnReason { get; set; }
    public string? ReturnStatus { get; set; }
    public string? RaisedByFullName { get; set; }
    public string? RaisedByEmail { get; set; }
    public Guid? VendorId { get; set; }
    public string? VendorName { get; set; }
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
    public Guid? GrnLineItemId { get; set; }
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public int? ReturnQuantity { get; set; }
    public string? LineItemReason { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}