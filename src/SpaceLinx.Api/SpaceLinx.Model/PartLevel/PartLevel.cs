namespace SpaceLinx.Model;

public partial class PartLevel : BaseModel
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? SortOrder { get; set; }
    public virtual ICollection<PartType> PartTypes { get; set; } = new List<PartType>();
}
