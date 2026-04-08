using Microsoft.AspNetCore.Http;

namespace SpaceLinx.Model
{
    public partial class ImageWriteModel : BaseWriteModel
    {
        public IFormFile? ImageFile { get; set; }
        public string? ImageType { get; set; }
    }
}