namespace SpaceLinx.Model;

public partial class PartLevelRefModel : BaseRefModel
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public int? SortOrder { get; set; }
}
