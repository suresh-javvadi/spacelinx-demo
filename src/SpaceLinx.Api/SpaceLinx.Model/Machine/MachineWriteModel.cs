namespace SpaceLinx.Model
{
    public partial class MachineWriteModel : BaseWriteModel
    {
        public string Number { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Guid MachineTypeId { get; set; }
    }
}
