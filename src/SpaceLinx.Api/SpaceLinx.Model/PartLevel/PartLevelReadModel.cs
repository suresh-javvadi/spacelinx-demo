namespace SpaceLinx.Model;

public partial class PartLevelReadModel : BaseReadModel
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int? SortOrder { get; set; }
}
