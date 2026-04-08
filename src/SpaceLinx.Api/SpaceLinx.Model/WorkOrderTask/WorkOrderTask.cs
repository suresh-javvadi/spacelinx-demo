namespace SpaceLinx.Model;

public partial class WorkOrderTask : BaseModel
{
    public Guid WorkOrderId { get; set; }
    public Guid GuideStepTaskId { get; set; }
    public string? TaskResponse { get; set; }
    public string Status { get; set; } = null!;
    public Guid? WorkOrderStepId { get; set; }
    public virtual GuideStepTask GuideStepTask { get; set; } = null!;
    public virtual WorkOrder WorkOrder { get; set; } = null!;
    public virtual WorkOrderStep? WorkOrderStep { get; set; }
}
