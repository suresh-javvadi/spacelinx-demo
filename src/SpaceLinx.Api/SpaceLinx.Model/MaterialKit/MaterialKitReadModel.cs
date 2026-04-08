namespace SpaceLinx.Model
{
    public partial class MaterialKitReadModel : BaseReadModel
    {
        public string Name { get; set; } = null!;
        public int Sequence { get; set; }
        public string Number { get; set; } = null!;
        public Guid PartId { get; set; }
        public Guid LocationId { get; set; }
        public Guid? ImageId { get; set; }
        public int Quantity { get; set; }
        public virtual ImageRefModel? Image { get; set; }
        public virtual LocationRefModel Location { get; set; } = null!;
        public virtual PartRefModel Part { get; set; } = null!;
    }
}
