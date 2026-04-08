using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Interfaces;

public interface IImageService
{
    Task<Image?> UploadImageAsync(ImageWriteModel newImage, Guid entityId, string entityType, string imageType = "image");
    Task DownloadBlobAsync<T>(string blobName, T model, Action<T, byte[]> setImageData);
    string GetContentType(string imageUrl);
    Task<byte[]> DownloadImageContentAsync(string imageUrl);
    Task RemoveImageAsync(Image image);
}
