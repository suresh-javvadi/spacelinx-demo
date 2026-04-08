namespace SpaceLinx.Model;

public partial class VendorReturnRequestRefModel : BaseRefModel
{
    public DateOnly? ReturnDate { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = null!;
}