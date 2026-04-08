namespace SpaceLinx.Model;

public partial class ToolType : BaseModel
{
    public string Name { get; set; } = null!;
    public virtual ICollection<Tool> Tools { get; set; } = new List<Tool>();
}
