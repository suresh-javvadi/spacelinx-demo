namespace SpaceLinx.Model
{
    public partial class MachineReadModel : BaseReadModel
    {
        public string Number { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Guid MachineTypeId { get; set; }
        public virtual MachineTypeRefModel MachineType { get; set; } = null!;
    }
}
