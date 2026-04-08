namespace SpaceLinx.Model;

public partial class Platform : BaseModel
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public virtual ICollection<Guide> Guides { get; set; } = new List<Guide>();
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
