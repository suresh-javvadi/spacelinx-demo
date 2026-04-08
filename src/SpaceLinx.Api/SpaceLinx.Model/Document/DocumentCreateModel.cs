using Microsoft.AspNetCore.Http;

namespace SpaceLinx.Model;

public partial class DocumentCreateModel
{
    public IFormFile? DocumentFile { get; set; }
    public Guid? EntityId { get; set; }
    public string? FileName { get; set; }
    public string? EntityType { get; set; }
    public string? DocumentType { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? ExternalUrl { get; set; }
    public List<string>? Tags { get; set; }
}
