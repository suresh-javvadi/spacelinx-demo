namespace SpaceLinx.Model
{
    public partial class ImageReadModel : BaseReadModel
    {
        public string ImageType { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public Guid EntityId { get; set; }
        public string FileName { get; set; } = null!;
        public string FileExtension { get; set; } = null!;
        public long FileSize { get; set; }
        public string FilePath { get; set; } = null!;
        public string FileRelativePath { get; set; } = null!;
    }
}