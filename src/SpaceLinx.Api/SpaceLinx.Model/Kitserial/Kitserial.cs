namespace SpaceLinx.Model;

public partial class KitSerial : BaseModel
{
    public Guid KitId { get; set; }
    public Guid PartId { get; set; }
    public string? Serialno { get; set; }
    public string? Status { get; set; }
    public virtual Kit Kit { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
}
