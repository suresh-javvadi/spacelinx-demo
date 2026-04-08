namespace SpaceLinx.Model;

public partial class Product : BaseModel
{
    public string Name { get; set; } = null!;
    public int Sequence { get; set; }
    public string Number { get; set; } = null!;
    public Guid? PlatformId { get; set; }
    public Guid PartId { get; set; }
    public Guid? ImageId { get; set; }
    public string? Description { get; set; }
    public virtual Image? Image { get; set; }
    public virtual Part Part { get; set; } = null!;
    public virtual Platform? Platform { get; set; }
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
    public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
    public virtual ICollection<WorkPackage> WorkPackages { get; set; } = new List<WorkPackage>();
}