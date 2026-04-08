namespace SpaceLinx.Model;

public partial class WorkOrderDetailReadModel : BaseReadModel
{
    public string Name { get; set; } = null!;
    public string Number { get; set; } = null!;
    public string Status { get; set; } = null!;
    public Guid? WorkPackageId { get; set; }
    public Guid? KitId { get; set; }
    public Guid? TechnicianId { get; set; }
    public Guid? ManagerId { get; set; }
    public Guid? GuideId { get; set; }
    public Guid PartId { get; set; }
    public Guid? ProductId { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }
    public TimeSpan? ExecutionTime { get; set; }
    public virtual GuideRefModel Guide { get; set; } = null!;
    public virtual KitRefModel? Kit { get; set; }
    public virtual UserRefModel Manager { get; set; } = null!;
    public virtual PartRefModel Part { get; set; } = null!;
    public virtual ProductRefModel? Product { get; set; }
    public virtual UserRefModel? Technician { get; set; }
    public virtual WorkPackageRefModel? WorkPackage { get; set; }
    public virtual ICollection<WorkOrderStepReadModel> WorkOrderSteps { get; set; } = new List<WorkOrderStepReadModel>();
    public virtual ICollection<WorkOrderTaskReadModel> WorkOrderTasks { get; set; } = new List<WorkOrderTaskReadModel>();
}
