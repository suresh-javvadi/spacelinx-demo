namespace SpaceLinx.Model;

public partial class Tool : BaseModel
{
    public string Number { get; set; } = null!;
    public string Name { get; set; } = null!;
    public Guid ToolTypeId { get; set; }
    public virtual ICollection<GuideStepEquipment> GuideStepEquipments { get; set; } = new List<GuideStepEquipment>();
    public virtual ToolType ToolType { get; set; } = null!;
}
