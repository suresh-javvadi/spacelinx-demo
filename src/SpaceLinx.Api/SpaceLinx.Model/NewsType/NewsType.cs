namespace SpaceLinx.Model;

public partial class NewsType : BaseModel
{
    public string Name { get; set; } = null!;
    public virtual ICollection<News> News { get; set; } = new List<News>();
}
