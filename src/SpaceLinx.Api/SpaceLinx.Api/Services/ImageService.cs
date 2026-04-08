using Azure.Storage.Blobs;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class ImageService(BlobServiceClient _blobServiceClient, SpaceLinxContext _spaceLinxContext,
    IHttpContextAccessor _contextAccessor, IConfiguration configuration) :
     BaseService(_spaceLinxContext, _contextAccessor), IImageService
{
    public async Task<Image?> UploadImageAsync(ImageWriteModel newImage, Guid entityId, string entityType, string imageType = "image")
    {
        string containerName = configuration["BlobStorage:ContainerName"];
        var container = _blobServiceClient.GetBlobContainerClient(containerName);
        var imageId = Guid.NewGuid();

        var blobPath = "images/" + imageId.ToString() + "_"
            + Path.GetFileName(newImage.ImageFile.FileName);
        var blob = container.GetBlobClient(blobPath);

        if (blob != null)
        {
            if (!await container.ExistsAsync())
            {
                await container.CreateIfNotExistsAsync();
            }
            await blob.UploadAsync(newImage.ImageFile.OpenReadStream());
        }

        var blobProperties = await blob.GetPropertiesAsync();
        var image = new Image
        {
            Id = imageId,
            ImageType = imageType,
            EntityType = entityType,
            EntityId = entityId,
            FileName = newImage.ImageFile.FileName,
            FileRelativePath = blobPath,
            FileExtension = Path.GetExtension(newImage.ImageFile.FileName),
            FilePath = blob.Uri.ToString(),
            FileSize = blobProperties.Value.ContentLength,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail
        };

        _spaceLinxContext.Images.Add(image);
        await _spaceLinxContext.SaveChangesAsync();

        return image;
    }

    public async Task DownloadBlobAsync<T>(string blobName, T model, Action<T, byte[]> setImageData)
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
            byte[] imageData = new byte[blobLength];
            int bytesRead = await stream.ReadAsync(imageData, 0, (int)blobLength);

            setImageData(model, imageData);
        }
    }

    public string GetContentType(string imageUrl)
    {
        var extension = Path.GetExtension(imageUrl)?.ToLower();
        return extension switch
        {
            ".jpeg" or ".jpg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            _ => null
        };
    }

    public async Task<byte[]> DownloadImageContentAsync(string imageUrl)
    {
        var client = new HttpClient();
        return await client.GetByteArrayAsync(imageUrl);
    }

    public async Task RemoveImageAsync(Image image)
    {
        string containerName = configuration["BlobStorage:ContainerName"];
        var container = _blobServiceClient.GetBlobContainerClient(containerName);

        var blob = container.GetBlobClient(image.FileRelativePath);

        if (await blob.ExistsAsync())
        {
            await blob.DeleteAsync();
        }

        _spaceLinxContext.Images.Remove(image);
        await _spaceLinxContext.SaveChangesAsync();
    }
}