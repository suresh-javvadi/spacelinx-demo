namespace SpaceLinx.Model;

public partial class KitBomComment : BaseModel
{
    public Guid KitId { get; set; }
    public Guid PartId { get; set; }
    public string? Comments { get; set; }
    public virtual Kit Kit { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
}
