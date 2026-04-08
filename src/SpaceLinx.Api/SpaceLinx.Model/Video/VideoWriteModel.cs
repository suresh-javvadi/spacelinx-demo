using Microsoft.AspNetCore.Http;

namespace SpaceLinx.Model;

public partial class VideoWriteModel : BaseWriteModel
{
    public IFormFile? VideoFile { get; set; }
    public string? VideoType { get; set; }
}