namespace SpaceLinx.Model;

public partial class Subsystem : BaseModel
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public virtual ICollection<Part> Parts { get; set; } = new List<Part>();
}
