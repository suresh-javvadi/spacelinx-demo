namespace SpaceLinx.Model;

public partial class EcoLogUpdateModel : BaseUpdateModel
{
    public Guid EcoId { get; set; }
    public string Action { get; set; } = null!;
    public DateTime ActionAt { get; set; }
    public string ActionBy { get; set; } = null!;
    public string? Notes { get; set; }
}