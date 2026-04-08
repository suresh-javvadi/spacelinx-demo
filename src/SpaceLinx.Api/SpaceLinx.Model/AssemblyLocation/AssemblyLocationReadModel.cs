namespace SpaceLinx.Model;

public partial class AssemblyLocationReadModel : BaseReadModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}