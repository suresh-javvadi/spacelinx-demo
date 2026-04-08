namespace SpaceLinx.Model
{
    public partial class KitSerialReadModel : BaseReadModel
    {
        public Guid KitId { get; set; }
        public Guid PartId { get; set; }
        public string? Serialno { get; set; }
        public string? Status { get; set; }
        public virtual KitRefModel Kit { get; set; } = null!;
        public virtual PartRefModel Part { get; set; } = null!;
    }
}
