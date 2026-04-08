namespace SpaceLinx.Model;

public partial class SubsystemReadModel : BaseReadModel
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
