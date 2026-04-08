namespace SpaceLinx.Model
{
    public partial class GuideDetailReadModel : BaseReadModel
    {
        public string Name { get; set; } = null!;
        public string Number { get; set; } = null!;
        public Guid? PlatformId { get; set; }
        public Guid PartId { get; set; }
        public Guid GuideTypeId { get; set; }
        public int Version { get; set; }
        public string Status { get; set; } = null!;
        public string? CheckOutBy { get; set; }
        public Guid? CloneFromId { get; set; }
        public virtual Guide? CloneFrom { get; set; }
        public double CalculatedWeight { get; set; }
        public string? Category { get; set; }
        public virtual ICollection<GuideStepEquipmentReadModel> GuideStepEquipments { get; set; } = new List<GuideStepEquipmentReadModel>();
        public virtual ICollection<GuideStepTaskReadModel> GuideStepTasks { get; set; } = new List<GuideStepTaskReadModel>();
        public virtual ICollection<GuideStepReadModel> GuideSteps { get; set; } = new List<GuideStepReadModel>();
        public virtual ICollection<Guide> InverseCloneFrom { get; set; } = new List<Guide>();
        public virtual GuideTypeRefModel GuideType { get; set; } = null!;
        public virtual PartRefModel Part { get; set; } = null!;
        public virtual PlatformRefModel? Platform { get; set; }
    }
}
