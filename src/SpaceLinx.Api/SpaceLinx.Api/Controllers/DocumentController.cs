using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class DocumentController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IDocumentService documentService) :
    GenericRestController<Document, DocumentWriteModel, DocumentUpdateModel, DocumentReadModel, DocumentRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("documents-with-users/{entityId}")]
    public async Task<IActionResult> GetDocumentsWithUsersByEntityId(Guid entityId)
    {
        var result = await spaceLinxContext.DocumentWithUsersVws
            .AsNoTracking()
            .Where(x => x.EntityId == entityId)
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("entity/{entityId}")]
    public async Task<IActionResult> GetEntityId(Guid entityId)
    {
        var documents = await spaceLinxContext.Documents.AsNoTracking()
            .Where(x => x.EntityId == entityId && x.DeletedBy == null)
            .ToListAsync();

        if (documents == null)
        {
            return NotFound();
        }

        var result = mapper.Map<List<DocumentReadModel>>(documents);
        return Ok(result);
    }

    [HttpPost("upload-documents")]
    public async Task<IActionResult> UploadDocuments([FromForm] IEnumerable<DocumentCreateModel> documentFiles)
    {
        if (documentFiles == null || !documentFiles.Any())
        {
            return BadRequest("No files uploaded.");
        }

        try
        {
            var documents = new List<Document>();

            foreach (var documentFile in documentFiles)
            {
                var document = await documentService.SaveDocumentAsync(documentFile);
                documents.Add(document);
            }

            return Ok(documents);
        }
        catch (ApplicationException ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    /// <summary>
    /// Gets all documents for Parts associated with a given ECO.
    /// </summary>
    [HttpGet("eco/{ecoId}/parts-documents")]
    public async Task<IActionResult> GetDocumentsForEcoParts(Guid ecoId)
    {
        var partIds = await spaceLinxContext.EcoParts
            .AsNoTracking()
            .Where(ep => ep.EcoId == ecoId && ep.DeletedBy == null)
            .Select(ep => ep.PartId)
            .Distinct()
            .ToListAsync();

        if (partIds.Count == 0)
        {
            return Ok(new List<PartDocumentReadModel>());
        }

        var result = await spaceLinxContext.Documents
            .AsNoTracking()
            .Where(d => d.EntityType == SpaceLinxEntities.Part
                     && partIds.Contains(d.EntityId)
                     && d.DeletedBy == null)
            .Join(spaceLinxContext.Parts.AsNoTracking(),
                d => d.EntityId,
                p => p.Id,
                (d, p) => new PartDocumentReadModel
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType,
                    EntityType = d.EntityType,
                    EntityId = d.EntityId,
                    FileName = d.FileName,
                    FileExtension = d.FileExtension,
                    FileSize = d.FileSize,
                    FilePath = d.FilePath,
                    FileRelativePath = d.FileRelativePath,
                    Title = d.Title,
                    Description = d.Description,
                    ExternalUrl = d.ExternalUrl,
                    MimeType = d.MimeType,
                    Tags = d.Tags,
                    Metadata = d.Metadata,
                    DocumentStorageType = d.DocumentStorageType,
                    CreatedBy = d.CreatedBy,
                    CreatedAt = d.CreatedAt,
                    UpdatedBy = d.UpdatedBy,
                    UpdatedAt = d.UpdatedAt,
                    PartId = p.Id!.Value,
                    PartNumber = p.PartNumber,
                    PartName = p.Name,
                    PartNumberSuffix = p.PartNumberSuffix
                })
            .OrderBy(d => d.PartNumber)
            .ToListAsync();

        return Ok(result);
    }

    /// <summary>
    /// Gets all documents for Parts associated with a given Requisition.
    /// </summary>
    [HttpGet("requisition/{requisitionId}/parts-documents")]
    public async Task<IActionResult> GetDocumentsForRequisitionParts(Guid requisitionId)
    {
        var partIds = await spaceLinxContext.RequisitionLineItems
            .AsNoTracking()
            .Where(rli => rli.RequisitionId == requisitionId && rli.DeletedBy == null)
            .Select(rli => rli.PartId)
            .Distinct()
            .ToListAsync();

        if (partIds.Count == 0)
        {
            return Ok(new List<PartDocumentReadModel>());
        }

        var result = await spaceLinxContext.Documents
            .AsNoTracking()
            .Where(d => d.EntityType == SpaceLinxEntities.Part
                     && partIds.Contains(d.EntityId)
                     && d.DeletedBy == null)
            .Join(spaceLinxContext.Parts.AsNoTracking(),
                d => d.EntityId,
                p => p.Id,
                (d, p) => new PartDocumentReadModel
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType,
                    EntityType = d.EntityType,
                    EntityId = d.EntityId,
                    FileName = d.FileName,
                    FileExtension = d.FileExtension,
                    FileSize = d.FileSize,
                    FilePath = d.FilePath,
                    FileRelativePath = d.FileRelativePath,
                    Title = d.Title,
                    Description = d.Description,
                    ExternalUrl = d.ExternalUrl,
                    MimeType = d.MimeType,
                    Tags = d.Tags,
                    Metadata = d.Metadata,
                    DocumentStorageType = d.DocumentStorageType,
                    CreatedBy = d.CreatedBy,
                    CreatedAt = d.CreatedAt,
                    UpdatedBy = d.UpdatedBy,
                    UpdatedAt = d.UpdatedAt,
                    PartId = p.Id!.Value,
                    PartNumber = p.PartNumber,
                    PartName = p.Name,
                    PartNumberSuffix = p.PartNumberSuffix
                })
            .OrderBy(d => d.PartNumber)
            .ToListAsync();

        return Ok(result);
    }

    /// <summary>
    /// Gets all documents for Parts associated with a given Purchase Order.
    /// </summary>
    [HttpGet("purchase-order/{purchaseOrderId}/parts-documents")]
    public async Task<IActionResult> GetDocumentsForPoParts(Guid purchaseOrderId)
    {
        var partIds = await spaceLinxContext.PoLineItems
            .AsNoTracking()
            .Where(pli => pli.PurchaseOrderId == purchaseOrderId && pli.DeletedBy == null && pli.PartId != null)
            .Select(pli => pli.PartId!.Value)
            .Distinct()
            .ToListAsync();

        if (partIds.Count == 0)
        {
            return Ok(new List<PartDocumentReadModel>());
        }

        var result = await spaceLinxContext.Documents
            .AsNoTracking()
            .Where(d => d.EntityType == SpaceLinxEntities.Part
                     && partIds.Contains(d.EntityId)
                     && d.DeletedBy == null)
            .Join(spaceLinxContext.Parts.AsNoTracking(),
                d => d.EntityId,
                p => p.Id,
                (d, p) => new PartDocumentReadModel
                {
                    Id = d.Id,
                    DocumentType = d.DocumentType,
                    EntityType = d.EntityType,
                    EntityId = d.EntityId,
                    FileName = d.FileName,
                    FileExtension = d.FileExtension,
                    FileSize = d.FileSize,
                    FilePath = d.FilePath,
                    FileRelativePath = d.FileRelativePath,
                    Title = d.Title,
                    Description = d.Description,
                    ExternalUrl = d.ExternalUrl,
                    MimeType = d.MimeType,
                    Tags = d.Tags,
                    Metadata = d.Metadata,
                    DocumentStorageType = d.DocumentStorageType,
                    CreatedBy = d.CreatedBy,
                    CreatedAt = d.CreatedAt,
                    UpdatedBy = d.UpdatedBy,
                    UpdatedAt = d.UpdatedAt,
                    PartId = p.Id!.Value,
                    PartNumber = p.PartNumber,
                    PartName = p.Name,
                    PartNumberSuffix = p.PartNumberSuffix
                })
            .OrderBy(d => d.PartNumber)
            .ToListAsync();

        return Ok(result);
    }

    /// <summary>
    /// Downloads multiple documents as a ZIP file.
    /// </summary>
    [HttpPost("download-zip")]
    public async Task<IActionResult> DownloadDocumentsAsZip([FromBody] List<Guid> documentIds, CancellationToken ct)
    {
        if (documentIds == null || documentIds.Count == 0)
        {
            return BadRequest("At least one document ID must be provided.");
        }

        try
        {
            var (zipData, fileName) = await documentService.DownloadDocumentsAsZipAsync(documentIds, ct);
            return File(zipData, "application/zip", fileName);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error downloading documents: {ex.Message}");
        }
    }
}