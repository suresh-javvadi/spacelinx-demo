namespace SpaceLinx.Model;

public partial class AssemblyLocation : BaseModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public virtual ICollection<Ebom> Eboms { get; set; } = new List<Ebom>();
}