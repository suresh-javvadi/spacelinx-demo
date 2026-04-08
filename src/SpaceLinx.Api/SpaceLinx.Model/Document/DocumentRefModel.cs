namespace SpaceLinx.Model
{
    public partial class DocumentRefModel : BaseRefModel
    {
        public string DocumentType { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public Guid EntityId { get; set; }
        public string FileName { get; set; } = null!;
        public List<string>? Tags { get; set; }
        public string? ExternalUrl { get; set; }
    }
}