using System.IO.Compression;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

public class DocumentService(BlobServiceClient _blobServiceClient, SpaceLinxContext _spaceLinxContext,
    IHttpContextAccessor _contextAccessor, IConfiguration configuration) :
     BaseService(_spaceLinxContext, _contextAccessor), IDocumentService
{
    public async Task<Document> SaveDocumentAsync(DocumentCreateModel documentModel, CancellationToken ct = default)
    {
        try
        {
            string containerName = configuration["BlobStorage:ContainerName"];
            var container = _blobServiceClient.GetBlobContainerClient(containerName);
            await container.CreateIfNotExistsAsync(cancellationToken: ct);

            var documentId = Guid.NewGuid();

            string fileName;
            string? fileExtension = null;
            long fileSize;
            string filePath;
            string fileRelativePath;
            string? title = null;
            string documentStorageType;
            string? mimeType = null;

            if (documentModel.DocumentFile is not null && documentModel.DocumentFile.Length > 0)
            {
                fileName = Path.GetFileName(documentModel.DocumentFile.FileName);
                fileExtension = Path.GetExtension(fileName);

                var blobPath = $"document/{documentId:N}_{fileName}";
                var blob = container.GetBlobClient(blobPath);

                mimeType = string.IsNullOrWhiteSpace(documentModel.DocumentFile.ContentType)
                    ? MapContentTypeFromExtension(fileExtension)
                    : documentModel.DocumentFile.ContentType;

                if (string.IsNullOrWhiteSpace(mimeType))
                {
                    mimeType = "application/octet-stream";
                }

                await blob.UploadAsync(
                    documentModel.DocumentFile.OpenReadStream(),
                    new BlobHttpHeaders { ContentType = mimeType },
                    cancellationToken: ct
                );

                fileSize = documentModel.DocumentFile.Length;
                filePath = blob.Uri.ToString();
                fileRelativePath = blobPath;
                documentStorageType = "uploaded";
            }
            else if (!string.IsNullOrWhiteSpace(documentModel.ExternalUrl))
            {
                documentStorageType = "external_url";

                fileName = documentModel.FileName;
                fileExtension = Path.GetExtension(fileName);

                mimeType = MapContentTypeFromExtension(fileExtension);

                fileSize = 0;
                filePath = documentModel.ExternalUrl;
                fileRelativePath = string.Empty;
            }
            else
            {
                throw new ArgumentException("Either a document file or an externalUrl must be provided.");
            }

            if (documentModel.EntityType.Equals(SpaceLinxEntities.Part, StringComparison.OrdinalIgnoreCase))
            {
                var part = await _spaceLinxContext.Parts
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == documentModel.EntityId);

                if (part == null)
                {
                    throw new ArgumentException($"Part with ID {documentModel.EntityId} not found.");
                }

                title = $"{part.PartNumber}_{documentModel.DocumentType}_{fileName}";
            }

            var document = new Document
            {
                DocumentType = documentModel.DocumentType,
                EntityType = documentModel.EntityType,
                EntityId = documentModel.EntityId.Value,
                FileName = fileName,
                FileExtension = fileExtension,
                FileSize = fileSize,
                FilePath = filePath,
                FileRelativePath = fileRelativePath,
                MimeType = mimeType,
                Title = title,
                Description = documentModel.Description,
                ExternalUrl = documentModel.ExternalUrl,
                Tags = null,
                Metadata = null,

                DocumentStorageType = documentStorageType,
                CreatedBy = UserEmail,
                IsActive = true,
            };

            _spaceLinxContext.Documents.Add(document);
            await _spaceLinxContext.SaveChangesAsync(ct);

            return document;
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Error saving document: {ex.Message}", ex);
        }
    }

    private static string ExtractFileNameFromUrl(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            return string.Empty;

        var lastSegment = Path.GetFileName(uri.LocalPath);

        if (!string.IsNullOrWhiteSpace(lastSegment))
        {
            foreach (var c in Path.GetInvalidFileNameChars())
            {
                lastSegment = lastSegment.Replace(c, '_');
            }
        }

        return lastSegment ?? string.Empty;
    }

    private static string? MapContentTypeFromExtension(string? extension)
    {
        if (string.IsNullOrWhiteSpace(extension))
            return null;

        switch (extension.ToLowerInvariant())
        {
            case ".png": return "image/png";
            case ".jpg": return "image/jpg";
            case ".jpeg": return "image/jpeg";
            case ".gif": return "image/gif";
            case ".webp": return "image/webp";
            case ".svg": return "image/svg+xml";

            case ".pdf": return "application/pdf";
            case ".txt": return "text/plain";
            case ".csv": return "text/csv";
            case ".json": return "application/json";
            case ".xml": return "application/xml";
            case ".zip": return "application/zip";

            case ".doc": return "application/msword";
            case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case ".xls": return "application/vnd.ms-excel";
            case ".xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".ppt": return "application/vnd.ms-powerpoint";
            case ".pptx": return "application/vnd.openxmlformats-officedocument.presentationml.presentation";

            default: return null;
        }
    }

    public async Task<Document> UpdateDocumentAsync(IFormFile documentFile, Guid documentId)
    {
        try
        {
            string containerName = configuration["BlobStorage:ContainerName"];
            var container = _blobServiceClient.GetBlobContainerClient(containerName);

            var blobPath = "document/" + documentId.ToString() + "_" + Path.GetFileName(documentFile.FileName);
            var blob = container.GetBlobClient(blobPath);

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = documentFile.ContentType
            };

            await blob.UploadAsync(documentFile.OpenReadStream(), blobHttpHeaders);

            var document = await _spaceLinxContext.Documents.FindAsync(documentId);
            if (document == null)
                throw new Exception($"Document with ID {documentId} not found.");

            document.FileName = documentFile.FileName;
            document.FileExtension = Path.GetExtension(documentFile.FileName);
            document.FileSize = (int)documentFile.Length;
            document.FilePath = blob.Uri.ToString();
            document.FileRelativePath = blobPath;
            document.ExternalUrl = document.ExternalUrl;
            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedBy = UserEmail;

            await _spaceLinxContext.SaveChangesAsync();

            return document;
        }
        catch (Exception ex)
        {
            throw new ApplicationException($"Error uploading document: {ex.Message}");
        }
    }

    //Extension
    public bool IsFileExtensionAllowed(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var whiteListedExtensions = configuration.GetSection("WhiteListedFileExtensions").Get<List<string>>();
        return whiteListedExtensions.Contains(extension);
    }

    public async Task<(byte[] ZipData, string FileName)> DownloadDocumentsAsZipAsync(List<Guid> documentIds, CancellationToken ct = default)
    {
        if (documentIds == null || documentIds.Count == 0)
        {
            throw new ArgumentException("At least one document ID must be provided.");
        }

        var documents = await _spaceLinxContext.Documents
            .AsNoTracking()
            .Where(d => documentIds.Contains(d.Id!.Value) && d.DeletedBy == null)
            .ToListAsync(ct);

        if (documents.Count == 0)
        {
            throw new ArgumentException("No documents found for the provided IDs.");
        }

        string containerName = configuration["BlobStorage:ContainerName"];
        var container = _blobServiceClient.GetBlobContainerClient(containerName);

        // Filter to only uploaded documents with valid paths
        var uploadedDocuments = documents
            .Where(d => d.DocumentStorageType != "external_url" && !string.IsNullOrWhiteSpace(d.FileRelativePath))
            .ToList();

        // Download all files in parallel
        var downloadTasks = uploadedDocuments.Select(async document =>
        {
            try
            {
                var blob = container.GetBlobClient(document.FileRelativePath);
                if (!await blob.ExistsAsync(ct))
                {
                    return null;
                }

                var download = await blob.DownloadContentAsync(ct);
                return new
                {
                    FileName = document.FileName ?? $"document_{document.Id}",
                    Data = download.Value.Content.ToArray()
                };
            }
            catch (Exception)
            {
                return null;
            }
        });

        var downloadedFiles = (await System.Threading.Tasks.Task.WhenAll(downloadTasks))
            .Where(f => f != null)
            .ToList();

        // Create ZIP archive (ZipArchive is not thread-safe, so we do this sequentially)
        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            var fileNameCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            foreach (var file in downloadedFiles)
            {
                var fileName = file!.FileName;
                if (fileNameCounts.TryGetValue(fileName, out int count))
                {
                    fileNameCounts[fileName] = count + 1;
                    var ext = Path.GetExtension(fileName);
                    var nameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
                    fileName = $"{nameWithoutExt}_{count + 1}{ext}";
                }
                else
                {
                    fileNameCounts[fileName] = 1;
                }

                var entry = archive.CreateEntry(fileName, CompressionLevel.Optimal);
                using var entryStream = entry.Open();
                await entryStream.WriteAsync(file.Data, ct);
            }
        }

        memoryStream.Position = 0;
        var zipFileName = $"Documents_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip";

        return (memoryStream.ToArray(), zipFileName);
    }
}