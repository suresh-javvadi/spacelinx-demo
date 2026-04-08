namespace SpaceLinx.Model;

public partial class Machine : BaseModel
{
    public string Number { get; set; } = null!;
    public string Name { get; set; } = null!;
    public Guid MachineTypeId { get; set; }
    public virtual ICollection<GuideStepEquipment> GuideStepEquipments { get; set; } = new List<GuideStepEquipment>();
    public virtual MachineType MachineType { get; set; } = null!;
}
