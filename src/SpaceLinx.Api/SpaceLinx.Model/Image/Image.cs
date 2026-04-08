namespace SpaceLinx.Model;

public partial class Image : BaseModel
{
    public string ImageType { get; set; } = null!;
    public string EntityType { get; set; } = null!;
    public Guid EntityId { get; set; }
    public string FileName { get; set; } = null!;
    public string FileExtension { get; set; } = null!;
    public long FileSize { get; set; }
    public string FilePath { get; set; } = null!;
    public string FileRelativePath { get; set; } = null!;
    public virtual ICollection<GuideStep> GuideSteps { get; set; } = new List<GuideStep>();
    public virtual ICollection<MaterialKit> MaterialKits { get; set; } = new List<MaterialKit>();
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    public virtual ICollection<WorkOrderStep> WorkOrderSteps { get; set; } = new List<WorkOrderStep>();
}