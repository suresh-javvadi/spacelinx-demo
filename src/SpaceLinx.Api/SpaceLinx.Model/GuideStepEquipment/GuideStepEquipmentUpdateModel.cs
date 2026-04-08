namespace SpaceLinx.Model
{
    public partial class GuideStepEquipmentUpdateModel : BaseUpdateModel
    {
        public string EquipmentType { get; set; } = null!;
        public Guid? PartId { get; set; }
        public Guid? ToolId { get; set; }
        public Guid? MachineId { get; set; }
        public int Quantity { get; set; }
    }
}
