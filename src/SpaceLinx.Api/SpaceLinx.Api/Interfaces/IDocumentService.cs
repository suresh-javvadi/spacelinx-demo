using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces
{
    public interface IDocumentService
    {
        Task<Document> SaveDocumentAsync(DocumentCreateModel documentModel, CancellationToken ct = default);
        Task<Document> UpdateDocumentAsync(IFormFile documentFile, Guid documentId);
        bool IsFileExtensionAllowed(string extension);
        Task<(byte[] ZipData, string FileName)> DownloadDocumentsAsZipAsync(List<Guid> documentIds, CancellationToken ct = default);
    }
}