namespace SpaceLinx.Model;

public partial class PartTypeCategoryReadModel : BaseReadModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
