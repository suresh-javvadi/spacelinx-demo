namespace SpaceLinx.Model;

public partial class MachineType : BaseModel
{
    public string Name { get; set; } = null!;
    public virtual ICollection<Machine> Machines { get; set; } = new List<Machine>();
}
