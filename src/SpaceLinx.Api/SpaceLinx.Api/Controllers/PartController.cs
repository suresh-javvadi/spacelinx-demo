using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using System.Data;
using static SpaceLinxEnums;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class PartController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IPartService partService, IImageService imageService, IBomService bomService, IPartCacheService partCacheService) :
    GenericRestController<Part, PartWriteModel, PartUpdateModel, PartReadModel, PartRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet]
    public override async Task<List<PartReadModel>> Get()
    {
        var parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Include(x => x.PartType)
            .Include(x => x.UnitOfMeasure)
            .Where(x => x.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        var partImage = mapper.Map<List<PartReadModel>>(parts);

        foreach (var part in partImage)
        {
            part.ImageUrl = await spaceLinxContext.Images
                .Where(img => img.EntityType == "Part" && img.EntityId == part.Id && img.DeletedBy == null)
                .Select(img => img.FilePath)
                .FirstOrDefaultAsync();
        }

        return partImage;
    }

    [HttpGet("parts-with-goods-and-services")]
    public async Task<IActionResult> GetByGoodsAndServices()
    {
        var records = await spaceLinxContext.Parts
            .AsNoTracking()
            .Include(x => x.PartType)
            .Include(x => x.UnitOfMeasure)
            .Where(x => x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(records);

        return Ok(result);
    }

    [HttpGet("Status")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var records = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => x.Status == status && x.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("DraftOrRelease")]
    public async Task<IActionResult> GetDraftAndReleaseParts()
    {
        var records = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => (x.Status == PartStatus.Draft || x.Status == PartStatus.Release) && x.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(records);
        return Ok(result);
    }

    [HttpGet("unique-parts")]
    public async Task<List<PartReadModel>> GetUniquePartsWithLatestVersion()
    {
        return await partCacheService.GetUniquePartsWithLatestVersionAsync();
    }

    [HttpPost]
    public override async Task<IActionResult> Post(PartWriteModel newRecord)
    {
        var result = await base.Post(newRecord);

        // Invalidate unique parts cache when a new part is created
        await partCacheService.InvalidateUniquePartsCacheAsync();

        return result;
    }

    [HttpGet("unique-parts/without-obsolete-parts")]
    public async Task<List<PartReadModel>> GetUniquePartsWithoutObsoleteParts()
    {
        var parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Include(x => x.PartType)
            .Include(x => x.UnitOfMeasure)
            .Where(x => x.Status != PartStatus.Obsolete && x.ItemType == null && x.DeletedBy == null)
            .GroupBy(x => x.PartNumberSuffix)
            .Select(x => x.OrderByDescending(x => x.Version).FirstOrDefault())
            .ToListAsync();

        return mapper.Map<List<PartReadModel>>(parts);
    }

    [HttpGet("unique-parts-Release")]
    public async Task<List<PartReadModel>> GetUniqueReleaseParts()
    {
        var parts = await spaceLinxContext.Parts
                        .AsNoTracking()
                        .Include(x => x.PartType)
                        .Include(x => x.UnitOfMeasure)
                        .Where(x => x.Status == PartStatus.Release && x.ItemType == null && x.DeletedBy == null)
                        .GroupBy(x => x.PartNumberSuffix)
                        .Select(x => x.OrderByDescending(x => x.Version).FirstOrDefault())
                        .ToListAsync();

        return mapper.Map<List<PartReadModel>>(parts);
    }
        
    [HttpGet("make-parts")]
    public async Task<IActionResult> GetMakeParts()
    {
        var parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => x.MakeBuy == ((int)MakeBuyEnum.Make) && x.ItemType == null && x.DeletedBy == null)
            .Include(x => x.PartType)
            .Include(x => x.UnitOfMeasure)
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(parts);
        return Ok(result);
    }

    [HttpGet("buy-parts")]
    public async Task<IActionResult> GetBuyParts()
    {
        var parts = await spaceLinxContext.Parts
        .AsNoTracking()
        .Where(x => x.MakeBuy == (int)MakeBuyEnum.Buy && x.ItemType == null && x.DeletedBy == null)
        .Select(x => new
        {
            x.Id,
            x.Name,
            x.PartNumber,
            x.ManufacturingPartNumber,
            x.ManufacturerName
        })
        .ToListAsync();

        return Ok(parts);
    }

    // GET: api/parts/make/with-ebom
    [HttpGet("make/with-ebom")]
    public async Task<IActionResult> GetMakePartsWithEbom()
    {
        var parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => x.MakeBuy == ((int)MakeBuyEnum.Make) && x.ItemType == null && x.DeletedBy == null)
            .Where(p => p.EbomParts.Any(e => e.IsActive))
            .Include(x => x.PartType)
            .Include(x => x.UnitOfMeasure)
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(parts);
        return Ok(result);
    }

    // GET: api/parts/make/without-ebom
    [HttpGet("make/without-ebom")]
    public async Task<IActionResult> GetMakePartsWithoutEbom()
    {
        var parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => x.MakeBuy == ((int)MakeBuyEnum.Make) && x.ItemType == null && x.DeletedBy == null)
            .Where(p => !p.EbomParts.Any(e => e.IsActive))
            .Include(x => x.PartType)
            .Include(x => x.UnitOfMeasure)
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(parts);
        return Ok(result);
    }

    [HttpGet("make/without-ebom-and-obsolete")]
    public async Task<IActionResult> GetMakePartsWithoutEbomAndObsolete()
    {
        var parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(p => p.Status != PartStatus.Obsolete)
            .Where(p => p.MakeBuy == (int)MakeBuyEnum.Make && p.ItemType == null && p.DeletedBy == null)
            .Where(p => !p.EbomParts.Any(e => e.IsActive))
            .Include(p => p.PartType)
            .Include(p => p.UnitOfMeasure)
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(parts);
        return Ok(result);
    }

    // GET: api/parts/make/without-ebom
    [HttpGet("draft/make/without-ebom")]
    public async Task<IActionResult> GetDraftMakePartsWithoutEbom()
    {
        var parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(p => p.Status == PartStatus.Draft)
            .Where(p => p.MakeBuy == ((int)MakeBuyEnum.Make) && p.ItemType == null && p.DeletedBy == null)
            .Where(p => !p.EbomParts.Any(e => e.IsActive))
            .Include(x => x.PartType)
            .Include(x => x.UnitOfMeasure)
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(parts);
        return Ok(result);
    }

    [HttpGet("draft-parts-without-parent")]
    public async Task<IActionResult> GetDraftPartsWithoutParent()
    {
        var draftParts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(p => p.Status == PartStatus.Draft && p.ItemType == null && p.DeletedBy == null)
            .ToListAsync();

        var filteredParts = draftParts
            .Where(p => !spaceLinxContext.Eboms.Any(e => e.PartId == p.Id))
            .ToList();

        var result = mapper.Map<List<PartReadModel>>(filteredParts);
        return Ok(result);
    }

    [HttpGet("Lookup-hasBom")]
    public async Task<IActionResult> GetPartsWithHasBom()
    {
        var Parts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => x.HasBom && x.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<PartDetailReadModel>>(Parts);
        return Ok(result);
    }

    [HttpGet("manufacturers")]
    public async Task<IActionResult> GetUniqueManufacturers()
    {
        var manufacturers = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => x.ItemType == null && x.DeletedBy == null && x.ManufacturerName != null)
            .Select(x => x.ManufacturerName)
            .Distinct()
            .ToListAsync();

        return Ok(manufacturers);
    }

    [HttpGet("versions/{id}")]
    public async Task<IActionResult> GetVersionsById(Guid id)
    {
        var part = await spaceLinxContext.Parts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.ItemType == null && x.DeletedBy == null);

        if (part == null)
        {
            return NotFound();
        }

        var matchingParts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Where(x => x.PartNumberSuffix == part.PartNumberSuffix && x.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return Ok(matchingParts);
    }

    [HttpGet("versions")]
    public async Task<IActionResult> GetVersionsBySuffix(string suffix)
    {
        var matchingParts = await spaceLinxContext.Parts
            .AsNoTracking()
            .Include(x => x.PartType)
            .ThenInclude(xt => xt.PartLevel)
            .Include(x => x.UnitOfMeasure)
            .Include(x => x.Eco)
            .Include(x => x.EbomParts)
            .ThenInclude(y => y.ChildPart)
            .Include(x => x.CountryOfOrigin)
            .Include(x => x.Subsystem)
            .Where(x => x.PartNumberSuffix == suffix && x.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        var result = new List<object>();

        foreach (var part in matchingParts)
        {
            var imageUrl = await spaceLinxContext.Images
                .Where(img => img.EntityType == "Part" && img.EntityId == part.Id && img.DeletedBy == null)
                .Select(img => img.FilePath)
                .FirstOrDefaultAsync();

            result.Add(new
            {
                part = mapper.Map<PartRefModel>(part),
                UnitOfMeasure = mapper.Map <UnitOfMeasureRefModel>(part.UnitOfMeasure),
                CountryOfOrigin = mapper.Map<CountryRefModel>(part.CountryOfOrigin),
                Eco = mapper.Map<EcoRefModel>(part.Eco),
                ebomParts = mapper.Map<List<EbomRefModel>>(part.EbomParts),
                subSystem = mapper.Map<SubsystemRefModel>(part.Subsystem),
                ImageUrl = imageUrl
            });
        }

        return Ok(result);
    }

    [HttpGet("Parent-Parts")]
    public async Task<IActionResult> GetParentParts()
    {
        var partDetails = await spaceLinxContext.Eboms
                .AsNoTracking()
                .Where(e => spaceLinxContext.Eboms
                    .Select(x => x.PartId)
                    .Distinct()
                    .Contains(e.PartId))
                .Select(e => e.Part)
                .Where(p => p.Status == PartStatus.Release && p.ItemType == null && p.DeletedBy == null)
                .Distinct()
                .ToListAsync();

        return Ok(partDetails);
    }

    [HttpGet("DraftOrRelease-Parent-Parts")]
    public async Task<List<PartReadModel>> GetDraftAndReleaseParentParts()
    {
        var partDetails = await spaceLinxContext.Eboms
            .AsNoTracking()
            .Where(e => spaceLinxContext.Eboms
                .Select(x => x.PartId)
                .Distinct()
                .Contains(e.PartId))
            .Select(e => e.Part)
            .Where(p => (p.Status == PartStatus.Draft || p.Status == PartStatus.Release) && p.ItemType == null && p.DeletedBy == null)
            .Distinct()
            .ToListAsync();

        return mapper.Map<List<PartReadModel>>(partDetails);
    }

    [HttpGet("ebom/parents/{partId}")]
    public async Task<List<PartReadModel>> GetParentPartsForEbom(Guid partId)
    {
        var eboms = await spaceLinxContext.Eboms
            .AsNoTracking()
            .Where(e => e.ChildPartId == partId && e.DeletedBy == null)
            .Include(e => e.Part)
            .ThenInclude(p => p.PartType)
            .ToListAsync();

        var parentParts = eboms
            .Select(e => e.Part)
            .Where(p => p.ItemType == null)
            .Distinct()
            .ToList();

        return mapper.Map<List<PartReadModel>>(parentParts);
    }

    [HttpGet("parent-parts-without-guides")]
    public async Task<IActionResult> GetPartsNotAssociatedWithGuidesAsync()
    {
        var parts = await spaceLinxContext.PartsNotAssociatedWithGuides
            .AsNoTracking()
            .ToListAsync();

        return Ok(parts);
    }

    [HttpGet("{id}")]
    public override async Task<ActionResult<PartReadModel>> Get(Guid id)
    {
        var records = await spaceLinxContext.Parts
        .AsNoTracking()
        .Include(x => x.PartType)
        .Include(x => x.UnitOfMeasure)
        .Where(x => x.Id == id && x.ItemType == null && x.DeletedBy == null)
        .SingleAsync();

        return mapper.Map<PartReadModel>(records);
    }

    [HttpGet("partNumber/{partNumber}")]
    public async Task<PartReadModel> GetbyNumber(string partNumber)
    {
        var record = await spaceLinxContext.Parts.AsNoTracking().FirstOrDefaultAsync(p => p.PartNumber == partNumber && p.ItemType == null && p.DeletedBy == null);
        return mapper.Map<PartReadModel>(record);
    }

    [HttpGet("parts-without-guides")]
    public async Task<IActionResult> GetPartsWithoutGuidesAsync()
    {
        var partIds = await spaceLinxContext.Guides
                .AsNoTracking()
                .Where(g => g.DeletedBy == null)
                .Select(g => g.PartId)
                .Distinct()
                .ToListAsync();

        var parts = await spaceLinxContext.Parts
                        .AsNoTracking()
                        .Where(p => !partIds.Contains(p.Id.Value) && p.ItemType == null && p.DeletedBy == null)
                        .ToListAsync();

        return Ok(parts);
    }

    [HttpGet("part-number-sequence")]
    public async Task<IActionResult> GetPartSequence(string sequence)
    {
        var outputParam = new NpgsqlParameter("next_sequence", NpgsqlDbType.Text)
        {
            Direction = ParameterDirection.Output
        };

        var inputParam = new NpgsqlParameter("input_sequence", sequence);

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                        "call mes.get_part_sequence({0}, null)",
                        inputParam,
                        outputParam
                    );

        var nextSequence = outputParam.Value?.ToString() ?? "No sequence generated";

        return Ok(nextSequence);
    }

    [HttpPost("Item")]
    public async Task<IActionResult> CreateItem(PartItemWriteModel newRecord)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var partType = await spaceLinxContext.PartTypes
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.CategoryType == newRecord.ItemType);

            var partEntity = new Part
            {
                Name = newRecord.Name,
                ShortDescription = newRecord.ShortDescription,
                Description = newRecord.Description,
                ItemType = newRecord.ItemType,
                PartTypeId = partType.Id.Value,
                MakeBuy = (int)MakeBuyEnum.Buy,
                UnitPrice = newRecord.UnitPrice,
                ReferenceNumber = newRecord.ReferenceNumber,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            spaceLinxContext.Parts.Add(partEntity);
            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            // Invalidate unique parts cache
            await partCacheService.InvalidateUniquePartsCacheAsync();

            return CreatedAtAction(nameof(Get), new { id = partEntity.Id }, partEntity);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("part-revise/{id}")]
    public async Task<IActionResult> RevisePart(Guid id)
    {
        var part = await partService.ClonePartWithNewVersion(id);
        if (part == null)
        {
            return NotFound("Part not found.");
        }

        // Invalidate unique parts cache since a new version was created
        await partCacheService.InvalidateUniquePartsCacheAsync();

        return Ok(part);
    }

    [HttpPut("image-upload/{partId}")]
    public async Task<IActionResult> ImageUpload(Guid partId, [FromForm] ImageWriteModel image)
    {
        var part = await spaceLinxContext.Parts
            .FirstOrDefaultAsync(x => x.Id == partId && x.DeletedBy == null);
        if (part == null)
        {
            return NotFound("Part does not exist.");
        }

        var existingImage = await spaceLinxContext.Images
            .FirstOrDefaultAsync(img => img.EntityId == partId && img.EntityType == SpaceLinxEntities.Part && img.DeletedBy == null);

        if (existingImage != null)
        {
            await imageService.RemoveImageAsync(existingImage);
        }

        if (image?.ImageFile != null)
        {
            await imageService.UploadImageAsync(image, partId, SpaceLinxEntities.Part, "Image");

            part.UpdatedBy = UserEmail;
            part.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();
        }

        return NoContent();
    }

    [HttpPut("{id}")]
    public override async Task<IActionResult> Update(Guid id, PartUpdateModel updatedRecord)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var existingRecord = await GetAsync(id);

            if (existingRecord is null)
            {
                return NotFound();
            }

            if(!partService.IsPartEditable(existingRecord.Id.Value))
            {
                throw new ApplicationException("Part is not editable.");
            }

            updatedRecord.Id = existingRecord.Id;

            await UpdateAsync(id, updatedRecord);

            await spaceLinxContext.Database.ExecuteSqlRawAsync("CALL mes.guide_mbom_refresh()");

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            // Invalidate BOM cache for this part and all parent parts
            await bomService.InvalidateBomCacheAsync(id);

            // Invalidate unique parts cache
            await partCacheService.InvalidateUniquePartsCacheAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("update-parttype-by-id")]
    public async Task<IActionResult> UpdatePartTypeById(Guid partId, Guid partTypeId)
    {
        var part = await spaceLinxContext.Parts
            .FirstOrDefaultAsync(p => p.Id == partId && p.DeletedBy == null);

        if (part == null)
        {
            return NotFound($"Part with Id {partId} not found.");
        }

        var partType = await spaceLinxContext.PartTypes
            .FirstOrDefaultAsync(pt => pt.Id == partTypeId);

        if (partType == null)
        {
            return NotFound($"PartType with Id {partTypeId} not found.");
        }

        part.PartTypeId = partTypeId;
        part.UpdatedBy = UserEmail;
        part.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        // Invalidate BOM cache for this part and all parent parts
        await bomService.InvalidateBomCacheAsync(partId);

        // Invalidate unique parts cache
        await partCacheService.InvalidateUniquePartsCacheAsync();

        return Ok(new { message = "PartType updated successfully." });
    }

    [HttpPut("update-parttype-by-name")]
    public async Task<IActionResult> UpdatePartTypeByName(string partNumber, string partTypeName)
    {
        var part = await spaceLinxContext.Parts
            .FirstOrDefaultAsync(p => p.PartNumber == partNumber && p.DeletedBy == null);

        if (part == null)
        {
            return NotFound($"Part with PartNumber {partNumber} not found.");
        }

        var partType = await spaceLinxContext.PartTypes
            .FirstOrDefaultAsync(pt => pt.Name == partTypeName);

        if (partType == null)
        {
            return NotFound($"PartType with Name {partTypeName} not found.");
        }

        part.PartTypeId = partType.Id.Value;
        part.UpdatedBy = UserEmail;
        part.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        // Invalidate BOM cache for this part and all parent parts
        await bomService.InvalidateBomCacheAsync(part.Id.Value);

        // Invalidate unique parts cache
        await partCacheService.InvalidateUniquePartsCacheAsync();

        return Ok(new { message = "PartType updated successfully." });
    }

    /// <summary>
    /// Manually triggers a refresh of the unique parts cache. Clears existing cache and rebuilds.
    /// </summary>
    [HttpPost("admin/refresh-unique-parts-cache")]
    public async Task<IActionResult> RefreshUniquePartsCache(
        [FromServices] IPartCacheRefreshService refreshService,
        CancellationToken cancellationToken)
    {
        var result = await refreshService.RefreshUniquePartsCacheAsync(cancellationToken);
        return Ok(result);
    }

    [HttpDelete("delete-part/{id}")]
    public async Task<IActionResult> DeletePart(Guid id)
    {
        try
        {
            var part = await spaceLinxContext.Parts
                .FirstOrDefaultAsync(r => r.Id == id);

            if (part == null)
            {
                return NotFound();
            }

            await spaceLinxContext.Database.ExecuteSqlInterpolatedAsync(
                $"CALL mes.validate_part_deletion({id})"
            );

            await RemoveAsync(id);
            await spaceLinxContext.SaveChangesAsync();

            // Invalidate BOM cache for this part and all parent parts
            await bomService.InvalidateBomCacheAsync(id);

            // Invalidate unique parts cache
            await partCacheService.InvalidateUniquePartsCacheAsync();

            return NoContent();
        }
        catch (PostgresException ex)
        {
            return BadRequest(new { error = ex.MessageText });
        }
        catch(Exception ex)
        {
            return StatusCode(500);
        }
    }
}