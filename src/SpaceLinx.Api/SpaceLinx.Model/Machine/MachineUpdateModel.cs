namespace SpaceLinx.Model
{
    public partial class MachineUpdateModel : BaseUpdateModel
    {
        public string Number { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Guid MachineTypeId { get; set; }
    }
}