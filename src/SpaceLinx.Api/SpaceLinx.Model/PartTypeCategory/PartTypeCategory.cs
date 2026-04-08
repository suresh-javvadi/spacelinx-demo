namespace SpaceLinx.Model;

public partial class PartTypeCategory : BaseModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public virtual ICollection<PartType> PartTypes { get; set; } = new List<PartType>();
}
