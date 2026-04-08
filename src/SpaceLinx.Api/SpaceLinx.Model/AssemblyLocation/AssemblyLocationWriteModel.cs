namespace SpaceLinx.Model;

public partial class AssemblyLocationWriteModel : BaseWriteModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}