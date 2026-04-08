namespace SpaceLinx.Model
{
    public partial class MachineRefModel : BaseRefModel
    {
        public string Number { get; set; } = null!;
        public string Name { get; set; } = null!;
        public virtual MachineTypeRefModel MachineType { get; set; } = null!;
    }
}
