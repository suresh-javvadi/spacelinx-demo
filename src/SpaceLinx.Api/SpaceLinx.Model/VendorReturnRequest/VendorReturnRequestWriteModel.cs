namespace SpaceLinx.Model;

public partial class VendorReturnRequestWriteModel : BaseWriteModel
{
    public Guid VendorId { get; set; }
    public Guid? PoId { get; set; }
    public Guid? GrnId { get; set; }
    public Guid? WoId { get; set; }
    public DateOnly? ReturnDate { get; set; }
    public Guid? RaisedById { get; set; }
    public string? Reason { get; set; }
    public Guid? LocationId { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedDate { get; set; }
}