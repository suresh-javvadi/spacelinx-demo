namespace SpaceLinx.Model
{
    public partial class KitBomCommentReadModel : BaseReadModel
    {
        public Guid KitId { get; set; }
        public Guid PartId { get; set; }
        public string? Comments { get; set; }
        public virtual KitRefModel Kit { get; set; } = null!;
        public virtual PartRefModel Part { get; set; } = null!;
    }
}
