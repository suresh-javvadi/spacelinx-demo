namespace SpaceLinx.Model;

public partial class GuideStep : BaseModel
{
    public string Title { get; set; } = null!;
    public Guid GuideId { get; set; }
    public Guid? ImageId { get; set; }
    public Guid? VideoId { get; set; }
    public int Sequence { get; set; }
    public string? Comment { get; set; }
    public virtual Guide Guide { get; set; } = null!;
    public virtual ICollection<GuideStepEquipment> GuideStepEquipments { get; set; } = new List<GuideStepEquipment>();
    public virtual ICollection<GuideStepTask> GuideStepTasks { get; set; } = new List<GuideStepTask>();
    public virtual Image? Image { get; set; }
    public virtual Video? Video { get; set; }
    public virtual ICollection<WorkOrderStep> WorkOrderSteps { get; set; } = new List<WorkOrderStep>();
}