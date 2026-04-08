namespace SpaceLinx.Model
{
    public partial class GuideStepEquipmentReadModel : BaseReadModel
    {
        public string EquipmentType { get; set; } = null!;
        public Guid? PartId { get; set; }
        public Guid? ToolId { get; set; }
        public Guid? MachineId { get; set; }
        public int Quantity { get; set; }
        public Guid GuideStepId { get; set; }
        public Guid GuideId { get; set; }
        public virtual GuideRefModel Guide { get; set; } = null!;
        public virtual GuideStepRefModel GuideStep { get; set; } = null!;
        public virtual MachineRefModel? Machine { get; set; }
        public virtual PartRefModel? Part { get; set; }
        public virtual ToolRefModel? Tool { get; set; }
    }
}
