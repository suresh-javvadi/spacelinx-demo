namespace SpaceLinx.Model;

public partial class AssemblyLocationAlterModel
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}