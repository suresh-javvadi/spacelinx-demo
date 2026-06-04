namespace SpaceLinx.Model;

public partial class Video : BaseModel
{
    public string VideoType { get; set; } = null!;
    public string EntityType { get; set; } = null!;
    public Guid? EntityId { get; set; }
    public string FileName { get; set; } = null!;
    public string FileExtension { get; set; } = null!;
    public int FileSize { get; set; }
    public string FilePath { get; set; } = null!;
    public string FileRelativePath { get; set; } = null!;
    public virtual ICollection<GuideStep> GuideSteps { get; set; } = new List<GuideStep>();
}