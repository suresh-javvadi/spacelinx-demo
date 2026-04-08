namespace SpaceLinx.Model
{
    public partial class DocumentReadModel : BaseReadModel
    {
        public string DocumentType { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public Guid EntityId { get; set; }
        public string FileName { get; set; } = null!;
        public string? FileExtension { get; set; }
        public long FileSize { get; set; }
        public string FilePath { get; set; } = null!;
        public string FileRelativePath { get; set; } = null!;
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ExternalUrl { get; set; }
        public string? MimeType { get; set; }
        public List<string>? Tags { get; set; }
        public string? Metadata { get; set; }
        public string DocumentStorageType { get; set; } = null!;
    }
}