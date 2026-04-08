namespace SpaceLinx.Model;

public partial class EcoPart : BaseModel
{
    public Guid EcoId { get; set; }
    public Guid PartId { get; set; }
    public string Status { get; set; } = null!;
    public string PreviousStatus { get; set; } = null!;
    public string? Description { get; set; }
    public string OldVersion { get; set; } = null!;
    public string? NewVersion { get; set; }
    public DateTime? EffectiveDate { get; set; }
    public virtual Eco Eco { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
}