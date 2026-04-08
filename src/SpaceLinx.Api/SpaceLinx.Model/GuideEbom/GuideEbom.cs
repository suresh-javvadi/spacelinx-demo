namespace SpaceLinx.Model;

public partial class GuideEbom : BaseModel
{
    public Guid GuideId { get; set; }
    public Guid PartId { get; set; }
    public Guid ChildPartId { get; set; }
    public int Quantity { get; set; }
    public virtual Part ChildPart { get; set; } = null!;
    public virtual Guide Guide { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
}
