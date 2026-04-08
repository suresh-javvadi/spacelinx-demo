namespace SpaceLinx.Model;

public partial class WorkOrderStep : BaseModel
{
    public Guid WorkOrderId { get; set; }
    public Guid GuideStepId { get; set; }
    public Guid? TechnicianId { get; set; }
    public Guid? ManagerId { get; set; }
    public string Status { get; set; } = null!;
    public TimeSpan? ExecutionTime { get; set; }
    public TimeSpan? CapturedTime { get; set; }
    public Guid? ImageId { get; set; }
    public string? Comment { get; set; }
    public virtual GuideStep GuideStep { get; set; } = null!;
    public virtual Image? Image { get; set; }
    public virtual User? Manager { get; set; }
    public virtual User? Technician { get; set; }
    public virtual WorkOrder WorkOrder { get; set; } = null!;
    public virtual ICollection<WorkOrderTask> WorkOrderTasks { get; set; } = new List<WorkOrderTask>();
}
