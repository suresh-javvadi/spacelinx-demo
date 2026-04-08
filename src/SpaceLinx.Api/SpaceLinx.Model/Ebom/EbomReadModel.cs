namespace SpaceLinx.Model
{
    public partial class EbomReadModel : BaseReadModel
    {
        public Guid PartId { get; set; }
        public Guid ChildPartId { get; set; }
        public int Quantity { get; set; }
        public Guid? AssemblyLocationId { get; set; }
        public virtual PartRefModel ChildPart { get; set; } = null!;
        public virtual PartRefModel Part { get; set; } = null!;
    }
}
