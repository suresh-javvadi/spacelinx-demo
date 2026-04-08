namespace SpaceLinx.Model;

public partial class EcoLog : BaseModel
{
    public Guid EcoId { get; set; }
    public string Action { get; set; } = null!;
    public DateTime ActionAt { get; set; }
    public string ActionBy { get; set; } = null!;
    public string? Notes { get; set; }
    public virtual Eco Eco { get; set; } = null!;
}