namespace SpaceLinx.Model
{
    public partial class ProductReadModel : BaseReadModel
    {
        public string Name { get; set; } = null!;
        public int Sequence { get; set; }
        public string Number { get; set; } = null!;
        public Guid? PlatformId { get; set; }
        public Guid PartId { get; set; }
        public Guid? ImageId { get; set; }
        public string? Description { get; set; }
        public virtual ImageRefModel? Image { get; set; }
        public virtual PartRefModel Part { get; set; } = null!;
        public virtual PlatformRefModel? Platform { get; set; }
    }
}
