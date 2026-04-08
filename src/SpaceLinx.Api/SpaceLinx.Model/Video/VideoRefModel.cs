namespace SpaceLinx.Model;

public partial class VideoRefModel : BaseRefModel
{
    public string VideoType { get; set; } = null!;
    public string EntityType { get; set; } = null!;
    public string FilePath { get; set; } = null!;
    public Guid EntityId { get; set; }
    public string FileName { get; set; } = null!;
}