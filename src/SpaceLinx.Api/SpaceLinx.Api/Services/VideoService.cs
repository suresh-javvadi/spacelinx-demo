using Azure.Storage.Blobs;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class VideoService(BlobServiceClient _blobServiceClient, SpaceLinxContext _spaceLinxContext, 
    IHttpContextAccessor _contextAccessor, IConfiguration configuration) :
     BaseService(_spaceLinxContext, _contextAccessor), IVideoService
{
    public async Task<Video?> UploadVideoAsync(VideoWriteModel newVideo, Guid entityId, string entityType, string videoType = "Video")
    {
        string containerName = configuration["BlobStorage:ContainerName"];
        var container = _blobServiceClient.GetBlobContainerClient(containerName);
        var videoId = Guid.NewGuid();
        var blobPath = "videos/" + videoId.ToString() + "_"
            + Path.GetFileName(newVideo?.VideoFile?.FileName);
        var blob = container.GetBlobClient(blobPath);

        if (blob != null)
        {
            if (!await container.ExistsAsync())
            {
                await container.CreateIfNotExistsAsync();
            }
            await blob.UploadAsync(newVideo?.VideoFile?.OpenReadStream());
        }

        var blobProperties = await blob.GetPropertiesAsync();
        var video = new Video
        {
            Id = videoId,
            VideoType = videoType,
            EntityId = entityId,
            EntityType = entityType,
            FileName = newVideo.VideoFile.FileName,
            FileRelativePath = blobPath,
            FileExtension = Path.GetExtension(newVideo.VideoFile.FileName),
            FilePath = blob.Uri.ToString(),
            FileSize = blobProperties.Value.ContentLength,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail
        };

        _spaceLinxContext.Videos.Add(video);
        await _spaceLinxContext.SaveChangesAsync();

        return video;
    }

    public async Task DownloadBlobAsync<T>(string blobName, T model, Action<T, byte[]> setVideoData)
    {
        string containerName = configuration["BlobStorage:ContainerName"];
        var container = _blobServiceClient.GetBlobContainerClient(containerName);
        var blob = container.GetBlobClient(blobName);

        if (blob == null)
        {
            return;
        }

        var download = await blob.DownloadAsync();
        using (var stream = download.Value.Content)
        {
            long blobLength = download.Value.ContentLength;
            byte[] videoData = new byte[blobLength];
            int bytesRead = await stream.ReadAsync(videoData, 0, (int)blobLength);

            setVideoData(model, videoData);
        }
    }

    public string GetVideoContentType(string videoUrl)
    {
        var extension = Path.GetExtension(videoUrl)?.ToLower();
        return extension switch
        {
            ".mp4" => "video/mp4",
            ".avi" => "video/x-msvideo",
            ".mov" => "video/quicktime",
            ".wmv" => "video/x-ms-wmv",
            ".flv" => "video/x-flv",
            _ => null
        };
    }

    public async Task<byte[]> DownloadVideoContentAsync(string videoUrl)
    {
        using var client = new HttpClient();
        return await client.GetByteArrayAsync(videoUrl);
    }
}
