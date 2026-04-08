namespace SpaceLinx.Model;

public partial class ScrapRequestRefModel : BaseRefModel
{
    public string ScrapNumber { get; set; } = null!;
    public DateOnly? ScrapDate { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = null!;
}