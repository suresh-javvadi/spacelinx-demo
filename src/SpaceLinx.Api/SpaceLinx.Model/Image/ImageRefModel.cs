namespace SpaceLinx.Model
{
    public partial class ImageRefModel : BaseRefModel
    {
        public string ImageType { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public Guid EntityId { get; set; }
        public string FileName { get; set; } = null!;

    }
}