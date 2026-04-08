namespace SpaceLinx.Model
{
    public partial class DocumentWithUsersVw
    {
        public Guid? Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? DocumentType { get; set; }
        public string? EntityType { get; set; }
        public Guid? EntityId { get; set; }
        public string? FileName { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public string? FilePath { get; set; }
        public string? FileRelativePath { get; set; }
        public string? MimeType { get; set; }
        public string? DocumentStorageType { get; set; }
        public string? ExternalUrl { get; set; }
        public List<string>? Tags { get; set; }
        public string? Metadata { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? CreatedByFullName { get; set; }
    }
}