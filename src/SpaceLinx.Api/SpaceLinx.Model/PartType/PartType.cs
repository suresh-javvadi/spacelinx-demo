namespace SpaceLinx.Model;

public partial class PartType : BaseModel
{
    public string Name { get; set; } = null!;
    public string? PartNumberPrefix { get; set; }
    public string? Category { get; set; }
    public string? CategoryType { get; set; }
    public bool IsVisibleInUi { get; set; }
    public string? Department { get; set; }
    public Guid? PartTypeCategoryId { get; set; }
    public Guid? PartLevelId { get; set; }
    public virtual PartLevel? PartLevel { get; set; }
    public virtual PartTypeCategory? PartTypeCategory { get; set; }
    public virtual ICollection<Part> Parts { get; set; } = new List<Part>();
}