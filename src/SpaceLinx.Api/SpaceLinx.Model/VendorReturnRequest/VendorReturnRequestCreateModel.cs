namespace SpaceLinx.Model;

public partial class VendorReturnRequestCreateModel
{
    public Guid VendorId { get; set; }
    public Guid? PoId { get; set; }
    public Guid? GrnId { get; set; }
    public Guid? WoId { get; set; }
    public DateOnly? ReturnDate { get; set; }
    public Guid? RaisedById { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = null!;
    public Guid? LocationId { get; set; }
    public List<VendorReturnLineItemCreateModel>? VendorReturnRequestItems { get; set; }
    public List<DocumentCreateModel>? DocumentFiles { get; set; }
}