using Microsoft.AspNetCore.Http;

namespace SpaceLinx.Model
{
    public partial class DocumentAlterModel  
    {
        public Guid DocumentId { get; set; }
        public IFormFile DocumentFile { get; set; } = null!;
        public string? ExternalUrl { get; set; }
    }
}