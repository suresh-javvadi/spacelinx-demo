namespace SpaceLinx.Model
{
    public partial class GuideStepEquipmentWriteModel : BaseWriteModel
    {
        public string EquipmentType { get; set; } = null!;
        public Guid? PartId { get; set; }
        public Guid? ToolId { get; set; }
        public Guid? MachineId { get; set; }
        public int Quantity { get; set; }
        public Guid GuideStepId { get; set; }
        public Guid GuideId { get; set; }
    }
}
