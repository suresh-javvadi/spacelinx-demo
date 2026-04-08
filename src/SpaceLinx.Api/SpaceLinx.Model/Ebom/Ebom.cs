namespace SpaceLinx.Model;

public partial class Ebom : BaseModel
{
    public Guid PartId { get; set; }
    public Guid ChildPartId { get; set; }
    public int Quantity { get; set; }
    public Guid? AssemblyLocationId { get; set; }
    public virtual AssemblyLocation? AssemblyLocation { get; set; }
    public virtual Part ChildPart { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
}
