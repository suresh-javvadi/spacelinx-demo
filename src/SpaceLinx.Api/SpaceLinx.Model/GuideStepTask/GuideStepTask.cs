namespace SpaceLinx.Model;

public partial class GuideStepTask : BaseModel
{
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string? Taskdetails { get; set; }
    public string? Description { get; set; }
    public int Ismandatory { get; set; }
    public int? Sequence { get; set; }
    public Guid GuideStepId { get; set; }
    public Guid GuideId { get; set; }
    public virtual Guide Guide { get; set; } = null!;
    public virtual GuideStep GuideStep { get; set; } = null!;
    public virtual ICollection<WorkOrderTask> WorkOrderTasks { get; set; } = new List<WorkOrderTask>();
}
