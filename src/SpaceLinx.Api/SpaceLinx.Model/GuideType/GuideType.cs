namespace SpaceLinx.Model;

public partial class GuideType : BaseModel
{
    public string Name { get; set; } = null!;
    public virtual ICollection<Guide> Guides { get; set; } = new List<Guide>();
}