namespace SpaceLinx.Model;

public partial class PartTypeCategoryUpdateModel : BaseUpdateModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}