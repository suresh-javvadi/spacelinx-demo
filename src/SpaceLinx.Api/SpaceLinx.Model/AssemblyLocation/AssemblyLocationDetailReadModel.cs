namespace SpaceLinx.Model;

public class AssemblyLocationDetailReadModel : BaseReadModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}