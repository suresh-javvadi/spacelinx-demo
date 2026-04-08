namespace SpaceLinx.Model;

public partial class Guide : BaseModel
{
    public string Name { get; set; } = null!;
    public int Sequence { get; set; }
    public string Number { get; set; } = null!;
    public Guid? PlatformId { get; set; }
    public Guid PartId { get; set; }
    public Guid GuideTypeId { get; set; }
    public int Version { get; set; }
    public string Status { get; set; } = null!;
    public string? CheckOutBy { get; set; }
    public Guid? CloneFromId { get; set; }
    public double CalculatedWeight { get; set; }
    public virtual Guide? CloneFrom { get; set; }
    public string? Category { get; set; }
    public virtual ICollection<GuideCheckOutHistory> GuideCheckOutHistories { get; set; } = new List<GuideCheckOutHistory>();
    public virtual ICollection<GuideEbom> GuideEboms { get; set; } = new List<GuideEbom>();
    public virtual ICollection<GuideMbom> GuideMboms { get; set; } = new List<GuideMbom>();
    public virtual ICollection<GuideStepEquipment> GuideStepEquipments { get; set; } = new List<GuideStepEquipment>();
    public virtual ICollection<GuideStepTask> GuideStepTasks { get; set; } = new List<GuideStepTask>();
    public virtual ICollection<GuideStep> GuideSteps { get; set; } = new List<GuideStep>();
    public virtual ICollection<Guide> InverseCloneFrom { get; set; } = new List<Guide>();
    public virtual ICollection<Issue> Issues { get; set; } = new List<Issue>();
    public virtual GuideType GuideType { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
    public virtual Platform? Platform { get; set; }
    public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
    public virtual ICollection<WorkPackage> WorkPackages { get; set; } = new List<WorkPackage>();
}