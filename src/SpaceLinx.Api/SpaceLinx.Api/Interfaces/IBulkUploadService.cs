using Newtonsoft.Json.Linq;
using SpaceLinx.Model;
using static SpaceLinx.Api.Services.BulkUploadService;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Interfaces;

public interface IBulkUploadService
{
    Task<BulkUpload> SaveImportedFileAsync(IFormFile excelFile, string type);
    Task<List<JObject>> ReadFileAsync(Stream fileStream);
    Task<List<FailedRecord>> ProcessFileAsync(Stream fileStream, string fileName, string type, Guid blobId);
    Task UpdateBulkUploadStatus(Guid id, string status, string error, int totalCount, int successCount, int failedCount);
}
