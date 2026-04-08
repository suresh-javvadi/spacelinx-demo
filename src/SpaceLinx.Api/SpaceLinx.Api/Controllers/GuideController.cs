using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Api.Services;
using SpaceLinx.Model;
using System.Data;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class GuideController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IGuideService guideService) :
    GenericRestController<Guide, GuideWriteModel, GuideUpdateModel, GuideReadModel, GuideRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("{guideId}/weight")]
    public async Task<IActionResult> GetCalculatedWeight(Guid guideId)
    {
        var totalWeight = await guideService.GetCalculatedWeightAsync(guideId);

        return Ok(totalWeight);
    }

    [HttpGet("{id}")]
    public override async Task<ActionResult<GuideReadModel>> Get(Guid id)
    {
        var guide = await guideService.GetGuideByIdAsync(id);
        if (guide == null)
        {
            return NotFound();
        }

        return guide;
    }

    [HttpGet("partshavingguide")]
    public async Task<IActionResult> GetPartsHavingGuide()
    {
        var result = await guideService.GetPartsHavingGuideAsync();

        return Ok(result);
    }

    [HttpGet("partshavingpublishedguide")]
    public async Task<IActionResult> GetPartsHavingPublishedGuide()
    {
        var result = await guideService.GetPartsHavingPublishedGuideAsync();

        return Ok(result);
    }

    [HttpGet("publishedversions/part/{partId}")]
    public async Task<List<GuideReadModel>> GetPublishedVersions(Guid partId)
    {
        var result = await guideService.GetPublishedVersionsAsync(partId);

        return result;
    }

    [HttpGet("versions/part/{partId}")]
    public async Task<List<GuideReadModel>> GetVersions(Guid partId)
    {
        var result = await guideService.GetVersionsAsync(partId);

        return result;
    }

    [HttpGet("platform/{platformId}")]
    public async Task<List<GuideReadModel>> GetByPlatform(Guid platformId)
    {
        var result = await guideService.GetByPlatformAsync(platformId);

        return result;
    }

    [HttpGet("{guideId}/details")]
    public async Task<GuideDetailReadModel> GetGuideDetails(Guid guideId)
    {
        var result = await guideService.GetGuideDetailsAsync(guideId);

        return result;
    }

    [HttpGet("{partId}/part")]
    public async Task<GuideReadModel> GetGuideByPart(Guid partId)
    {
        var result = await guideService.GetGuideByPartAsync(partId);

        return result;
    }

    [HttpGet("unique-guides")]
    public async Task<List<GuideReadModel>> GetUniqueGuidesWithLatestVersion()
    {
        var result = await guideService.GetUniqueGuidesWithLatestVersionAsync();

        return result;
    }

    [HttpGet("{guideNumber}/version")]
    public async Task<IActionResult> GetVersionByGuideNumber(string guideNumber)
    {
        var guides = await guideService.GetVersionsByGuideNumberAsync(guideNumber);

        return Ok(guides);
    }

    [HttpGet("{guideId}/versions")]
    public async Task<IActionResult> GetVersionByGuidesId(Guid guideId)
    {
        var guides = await guideService.GetVersionsByGuideIdAsync(guideId);
        
        if (guides == null)
        {
            return NotFound();
        }

        return Ok(guides);
    }

    [HttpGet("{guideId}/guide-ebom")]
    public async Task<IActionResult> GetGuideEbom(Guid guideId)
    {
        var guideEbom = await guideService.GetGuideEbomByGuideIdAsync(guideId);
       
        return Ok(guideEbom);
    }

    [HttpGet("{guideId}/mbom")]
    public async Task<IActionResult> GetGuideMbom(Guid guideId)
    {
        var guideMbom = await guideService.GetGuideMbomAsync(guideId);
        
        return Ok(guideMbom);
    }

    [HttpGet("{kitId}/kit-mbom")]
    public async Task<IActionResult> GetKitMbom(Guid kitId)
    {
        var kitMbom = await (from k in spaceLinxContext.Kits
                             join wo in spaceLinxContext.WorkOrders on k.Id equals wo.KitId
                             join g in spaceLinxContext.GuideMbomVws on wo.GuideId equals g.GuideId
                             where k.Id == kitId && k.DeletedBy == null
                             select g)
                  .AsNoTracking()
                  .ToListAsync();

        return Ok(kitMbom);
    }

    [HttpGet("Child-Guides/{partId}")]
    public async Task<IActionResult> GetChildGuides(Guid partId)
    {
        var eboms = await spaceLinxContext.Eboms.AsNoTracking().Where(e => e.PartId == partId && e.DeletedBy == null).ToListAsync();
        if (eboms == null || !eboms.Any())
        {
            return NotFound();
        }

        var bomParts = new List<object>();

        foreach (var ebom in eboms)
        {
            var part = await spaceLinxContext.Parts.FindAsync(ebom.ChildPartId);
            if (part != null && part.ItemType == null)
            {
                var guide = await spaceLinxContext.Guides.AsNoTracking().FirstOrDefaultAsync(x => x.PartId == part.Id && x.DeletedBy == null);
                if (guide != null)
                {
                    bomParts.Add(new
                    {
                        GuideId = guide.Id,
                        Number = guide.Number,
                        Name = guide.Name,
                        PartName = part.Name,
                        PartNumber = part.PartNumber,
                        Version = guide.Version,
                        Status = guide.Status
                    });
                }
            }
        }

        return Ok(bomParts);
    }

    [HttpPost]
    public override async Task<IActionResult> Post(GuideWriteModel guideWriteModel)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await CreateAsync(guideWriteModel);
            var newGuideId = record.Id.Value;

            await guideService.CreateGuideFirstStepAsync(newGuideId);
            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                           "call mes.create_guide_mbom({0}, {1})",
                           record.Id,
                           UserEmail
                       );


            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return CreatedAtAction(nameof(Get), new { id = record?.Id }, record);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("draftguide/{guideId}")]
    public async Task<IActionResult> CreateDraftGuide(Guid guideId)
    {
        var record = await GetAsync(guideId);
        if (record is null)
        {
            return NotFound();
        }

        var newGuideIdParameter = new NpgsqlParameter("new_guide_id", NpgsqlDbType.Uuid)
        {
            Direction = ParameterDirection.Output
        };

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                "call mes.create_draft_guide({0}, {1}, null)",
                guideId,
                UserEmail,
                newGuideIdParameter
        );

        Guid newGuideId = (Guid)newGuideIdParameter.Value;

        return Ok(newGuideId);
    }

    [HttpPost("clone/{guideId}/{newPartId}")]
    public async Task<IActionResult> CloneGuide(Guid guideId, Guid newPartId)
    {
        var record = await GetAsync(guideId);
        if (record is null)
        {
            return NotFound();
        }

        var newGuideIdParameter = new NpgsqlParameter("new_guide_id", NpgsqlDbType.Uuid)
        {
            Direction = ParameterDirection.Output
        };

        var newGuideNumberParameter = new NpgsqlParameter("new_guide_number", NpgsqlDbType.Text)
        {
            Direction = ParameterDirection.Output
        };

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                        "call mes.clone_guide({0}, {1}, {2}, null, null)",
                        guideId,
                        newPartId,
                        UserEmail,
                        newGuideIdParameter,
                        newGuideNumberParameter
                    );

        Guid newGuideId = (Guid)newGuideIdParameter.Value;
        var newGuideNumber = newGuideNumberParameter.Value;

        return Ok(new { newGuideId, newGuideNumber });
    }

    [HttpPut("change-part/{guideNumber}")]
    public async Task<IActionResult> ChangePart(string guideNumber, Guid newPartId)
    {
        var guide = await spaceLinxContext.Guides.FirstOrDefaultAsync(g => g.Number == guideNumber && g.DeletedBy == null);
        if (guide == null)
        {
            throw new ApplicationException("Guide not found.");
        }
        else if (guide.Status != "Draft")
        {
            throw new ApplicationException("Guide can only be changed if it is in Draft status.");
        }
        else if (guide.CheckOutBy != null && guide.CheckOutBy != UserEmail)
        {
            throw new ApplicationException("Guide checked-out by a different user");
        }

        var publishedVersions = await spaceLinxContext.Guides.AsNoTracking()
                                            .AnyAsync(g => g.Number == guideNumber && g.DeletedBy == null && g.Status != "Draft" && g.Version != guide.Version);

        if (publishedVersions)
        {
            throw new ApplicationException("Guide has published versions. Part update is not allowed.");
        }

        guide.PartId = newPartId;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("publish/{guideId}")]
    public async Task<IActionResult> PublishGuide(Guid guideId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await spaceLinxContext.Guides.FirstOrDefaultAsync(g => g.Id == guideId && g.DeletedBy == null);
            if (record == null)
            {
                return NotFound();
            }
            else if (record.CheckOutBy != null && record.CheckOutBy != UserEmail)
            {
                throw new ApplicationException("Guide checked-out by a different user");
            }

            record.Status = "Published";
            record.UpdatedBy = UserEmail;
            record.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();
            await spaceLinxContext.Database.ExecuteSqlRawAsync("call mes.create_guide_ebom({0}, {1})", guideId, UserEmail);

            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new ApplicationException($"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{id}")]
    public override async Task<IActionResult> Update(Guid id, GuideUpdateModel updatedRecord)
    {
        var record = await GetAsync(id);

        if (record is null)
        {
            return NotFound();
        }
        else if (record.Status == "Published")
        {
            throw new ApplicationException("Cannot update a Published Guide");
        }
        else if (record.CheckOutBy != null && record.CheckOutBy != UserEmail)
        {
            throw new ApplicationException("Guide checked-out by a different user");
        }

        updatedRecord.Id = record.Id;

        await UpdateAsync(id, updatedRecord);

        return NoContent();
    }

    //Can only be enabled for Admin access
    [HttpPut("{guideId}/force-check-out")]
    public async Task<IActionResult> GuideForceCheckOut(Guid guideId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await spaceLinxContext.Guides.FirstOrDefaultAsync(g => g.Id == guideId && g.DeletedBy == null);
            if (record == null)
            {
                return NotFound();
            }

            record.CheckOutBy = UserEmail;
            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = UserEmail;

            var newCheckOutRecord = new GuideCheckOutHistoryWriteModel()
            {
                GuideId = record.Id.Value,
                IsCheckedOut = true
            };

            var checkOutRecord = mapper.Map<GuideCheckOutHistory>(newCheckOutRecord);
            checkOutRecord.CreatedBy = UserEmail;
            checkOutRecord.IsActive = true;

            await spaceLinxContext.GuideCheckOutHistories.AddAsync(checkOutRecord);
            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new ApplicationException($"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("{guideId}/check-out")]
    public async Task<IActionResult> GuideCheckOut(Guid guideId)
    {
        await guideService.GuideCheckOutAsync(guideId);

        return Ok();
    }

    [HttpPut("{guideId}/check-in")]
    public async Task<IActionResult> GuideCheckIn(Guid guideId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await spaceLinxContext.Guides.FirstOrDefaultAsync(g => g.Id == guideId && g.DeletedBy == null);
            if (record == null)
            {
                return NotFound();
            }
            else if (record.CheckOutBy != null && record.CheckOutBy != UserEmail)
            {
                throw new ApplicationException("Guide checked-out by a different user");
            }

            record.CheckOutBy = null;
            record.UpdatedBy = UserEmail;
            record.UpdatedAt = DateTime.UtcNow;

            var checkOutRecord = await spaceLinxContext.GuideCheckOutHistories.FirstOrDefaultAsync(x => x.GuideId == record.Id.Value && x.DeletedBy == null);
            if (checkOutRecord == null)
            {
                return NotFound();
            }

            checkOutRecord.IsCheckedOut = false;
            checkOutRecord.UpdatedBy = UserEmail;
            checkOutRecord.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("guidepublish/{guideId}")]
    public async Task<IActionResult> GuidePublish(Guid guideId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var guide = await spaceLinxContext.Guides.FirstOrDefaultAsync(g => g.Id == guideId && g.DeletedBy == null);
            if (guide == null)
                return NotFound();

            if (guide.CheckOutBy != null && guide.CheckOutBy != UserEmail)
            {
                return BadRequest("Guide is checked out by another user.");
            }

            var rootPartId = guide.PartId;
            var allPartIds = new HashSet<Guid> { rootPartId };

            var queue = new Queue<Guid>();
            queue.Enqueue(rootPartId);

            while (queue.Count > 0)
            {
                var currentPartId = queue.Dequeue();

                var childIds = await spaceLinxContext.Eboms
                    .Where(e => e.PartId == currentPartId && e.DeletedBy == null)
                    .Select(e => e.ChildPartId)
                    .ToListAsync();

                foreach (var childId in childIds)
                {
                    if (allPartIds.Add(childId))
                        queue.Enqueue(childId);
                }
            }

            var parts = await spaceLinxContext.Parts
                .Where(p => allPartIds.Contains(p.Id.Value) && p.DeletedBy == null)
                .ToListAsync();

            var nonReleasedParts = parts
                .Where(p => p.Status != "Release")
                .ToList();

            if (nonReleasedParts.Any())
            {
                return BadRequest(new
                {
                    message = "Cannot publish guide. Some parts are not in 'Release' status.",
                    nonReleasedParts = nonReleasedParts.Select(p => new { p.Id, p.Name, p.Status })
                });
            }

            guide.Status = "Published";
            guide.UpdatedBy = UserEmail;
            guide.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();
            await spaceLinxContext.Database.ExecuteSqlRawAsync("call mes.create_guide_ebom({0}, {1})", guideId, UserEmail);

            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new ApplicationException($"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var guide = await spaceLinxContext.Guides.FindAsync(id);

            if (guide == null)
            {
                return NotFound();
            }
            else if (guide.Status != "Draft")
            {
                throw new ApplicationException("Guide cannot be deleted");
            }
            else if (guide.CheckOutBy != null && guide.CheckOutBy != UserEmail)
            {
                throw new ApplicationException("Guide checked-out by a different user");
            }
            var mboms = spaceLinxContext.GuideMboms.Where(x => x.GuideId == id);
            spaceLinxContext.GuideMboms.RemoveRange(mboms);

            await RemoveAsync(id);
            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}