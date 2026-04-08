namespace SpaceLinx.Model;

public partial class ScrapRequestWriteModel : BaseWriteModel
{
    public Guid? LocationId { get; set; }
    public Guid? RaisedById { get; set; }
    public DateOnly? ScrapDate { get; set; }
    public string? Reason { get; set; }
    public Guid? PoId { get; set; }
    public Guid? GrnId { get; set; }
    public Guid? WoId { get; set; }
    public string Status { get; set; } = null!;
}