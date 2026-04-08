using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Interfaces
{
    public interface IVideoService
    {
        Task<Video?> UploadVideoAsync(VideoWriteModel newVideo, Guid entityId, string entityType, string videoType = "video");
        Task DownloadBlobAsync<T>(string blobName, T model, Action<T, byte[]> setVideoData);
        string GetVideoContentType(string videoUrl);
        Task<byte[]> DownloadVideoContentAsync(string videoUrl);
    }
}
