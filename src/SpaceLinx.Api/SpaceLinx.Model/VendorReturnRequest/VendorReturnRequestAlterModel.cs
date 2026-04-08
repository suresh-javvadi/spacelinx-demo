namespace SpaceLinx.Model;

public partial class VendorReturnRequestAlterModel
{
    public Guid VendorId { get; set; }
    public Guid? PoId { get; set; }
    public Guid? GrnId { get; set; }
    public Guid? WoId { get; set; }
    public DateOnly? ReturnDate { get; set; }
    public Guid? RaisedById { get; set; }
    public string? Reason { get; set; }
    public Guid? LocationId { get; set; }
    public List<VendorReturnLineItemAlterModel>? VendorReturnLineItems { get; set; }
    public List<DocumentCreateModel>? DocumentFiles { get; set; }
}