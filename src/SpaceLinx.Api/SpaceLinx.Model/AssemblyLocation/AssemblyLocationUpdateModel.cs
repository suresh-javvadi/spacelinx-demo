namespace SpaceLinx.Model;

public partial class AssemblyLocationUpdateModel : BaseUpdateModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}