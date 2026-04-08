namespace SpaceLinx.Model;

public partial class News : BaseModel
{
    public string Title { get; set; } = null!;
    public Guid NewsTypeId { get; set; }
    public string Hyperlink { get; set; } = null!;
    public string Origin { get; set; } = null!;
    public string Image { get; set; } = null!;
    public virtual NewsType NewsType { get; set; } = null!;
}
