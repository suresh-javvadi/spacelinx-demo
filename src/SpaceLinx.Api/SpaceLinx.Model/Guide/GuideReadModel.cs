namespace SpaceLinx.Model
{
    public partial class GuideReadModel : BaseReadModel
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
        public double CalculatedWeight { get; set; }
        public string? Category { get; set; }
        public virtual Guide? CloneFrom { get; set; }
        public virtual GuideTypeRefModel GuideType { get; set; } = null!;
        public virtual PartRefModel Part { get; set; } = null!;
        public virtual PlatformRefModel? Platform { get; set; }
    }
}
