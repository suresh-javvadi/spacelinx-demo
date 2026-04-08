namespace SpaceLinx.Model;

public partial class PartTypeCategoryWriteModel : BaseWriteModel
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
}
