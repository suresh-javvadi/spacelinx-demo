namespace SpaceLinx.Model;

public partial class GuideStepEquipment : BaseModel
{
    public string EquipmentType { get; set; } = null!;
    public Guid? PartId { get; set; }
    public Guid? ToolId { get; set; }
    public Guid? MachineId { get; set; }
    public int Quantity { get; set; }
    public Guid GuideStepId { get; set; }
    public Guid GuideId { get; set; }
    public virtual Guide Guide { get; set; } = null!;
    public virtual GuideStep GuideStep { get; set; } = null!;
    public virtual Machine? Machine { get; set; }
    public virtual Part? Part { get; set; }
    public virtual Tool? Tool { get; set; }
}
