namespace SpaceLinx.Model;

public partial class TenderRefModel : BaseRefModel
{
    public string TenderNumber { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateOnly ClosingDate { get; set; }
}
