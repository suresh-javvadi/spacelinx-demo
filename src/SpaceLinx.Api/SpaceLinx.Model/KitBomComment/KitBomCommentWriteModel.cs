namespace SpaceLinx.Model
{
    public partial class KitBomCommentWriteModel : BaseWriteModel
    {
        public Guid KitId { get; set; }
        public Guid PartId { get; set; }
        public string? Comments { get; set; }
    }
}
