using AutoMapper;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using static SpaceLinx.Api.Services.BulkUploadService;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class BulkUploadController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, BlobServiceClient blobServiceClient, IConfiguration configuration, IBulkUploadService bulkUploadService) :
    GenericRestController<BulkUpload, BulkUploadWriteModel, BulkUploadUpdateModel, BulkUploadReadModel, BulkUploadRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("template/{templateName}")]
    public async Task<IActionResult> DownloadTemplateAsync(string templateName)
    {
        string blobTemplateFileName = $"{templateName}-Template.xlsx";
        if (string.IsNullOrEmpty(blobTemplateFileName))
        {
            return NotFound();
        }

        string containerName = configuration["BlobStorage:ContainerName"];
        var container = blobServiceClient.GetBlobContainerClient(containerName);
        var blob = container.GetBlobClient($"bulkupload/template/{blobTemplateFileName}");

        if (blob == null)
        {
            return NotFound();
        }

        var download = await blob.DownloadAsync();
        var properties = (await blob.GetPropertiesAsync()).Value;
        var stream = new FileStreamResult(download.Value.Content, properties.ContentType)
        {
            FileDownloadName = blobTemplateFileName,
        };

        return await Task.FromResult(stream);
    }

    [HttpPost("Import/{type}")]
    public async Task<IActionResult> Import(IFormFile file, string type)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file uploaded.");
        }

        using (var stream = new MemoryStream())
        {
            await file.CopyToAsync(stream);
            stream.Position = 0;

            var bulkUploadRecord = await bulkUploadService.SaveImportedFileAsync(file, type);
            using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
            try
            {
                var failedRecords = await bulkUploadService.ProcessFileAsync(stream, file.FileName, type, bulkUploadRecord.Id.Value);

                var response = new
                {
                                    Message = failedRecords.Any()
                    ? "Some or all records failed validation."
                    : "File processed successfully.",
                                    FailedRecords = failedRecords.Any()
                    ? failedRecords
                    : new List<FailedRecord>()
                };

                await transaction.CommitAsync();
                return Ok(response);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                await bulkUploadService.UpdateBulkUploadStatus(bulkUploadRecord.Id.Value, "Error", ex.ToString(), bulkUploadRecord.FailedCount.Value, 0, bulkUploadRecord.FailedCount.Value);
                return StatusCode(500, $"Could not process uploaded file");
            }
        }         
    }
}
