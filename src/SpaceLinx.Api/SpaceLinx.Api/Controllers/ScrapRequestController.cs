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
public class ScrapRequestController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IDocumentService documentService) :
    GenericRestController<ScrapRequest, ScrapRequestWriteModel, ScrapRequestUpdateModel, ScrapRequestReadModel, ScrapRequestRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("scrap-with-user")]
    public async Task<IActionResult> GetScrapWithUser()
    {
        var result = await spaceLinxContext.ScrapRequestWithUserVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetScrapRequestDetails(Guid id)
    {
        var record = await spaceLinxContext.ScrapRequests
            .AsNoTracking()
            .Include(r => r.ScrapLineItems)
            .FirstOrDefaultAsync(r => r.Id == id && r.DeletedBy == null);

        if (record == null)
            return NotFound("Scrap Request not found.");

        return Ok(record);
    }

    [HttpPost("scrap-details")]
    public async Task<IActionResult> CreateScrapRequest([FromForm] ScrapRequestCreateModel requestModel)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var user = await spaceLinxContext.Users.FirstOrDefaultAsync(x => x.Email == UserEmail && x.DeletedBy == null);

            var scrap = new ScrapRequest
            {
                LocationId = requestModel.LocationId,
                PoId = requestModel.PoId,
                GrnId = requestModel.GrnId,
                WoId = requestModel.WoId,
                ScrapDate = requestModel.ScrapDate,
                Reason = requestModel.Reason,
                Status = requestModel.Status,
                RaisedById = user.Id,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            spaceLinxContext.ScrapRequests.Add(scrap);
            await spaceLinxContext.SaveChangesAsync();

            if (requestModel.ScrapLineItems != null && requestModel.ScrapLineItems.Any())
            {
                foreach (var item in requestModel.ScrapLineItems)
                {
                    var line = new ScrapLineItem
                    {
                        ScrapRequestId = scrap.Id.Value,
                        PartId = item.PartId,
                        TrackingType = item.TrackingType,
                        TrackingId = item.TrackingId,
                        ScrapQuantity = item.ScrapQuantity,
                        Reason = item.Reason,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow
                    };

                    spaceLinxContext.ScrapLineItems.Add(line);
                    await spaceLinxContext.SaveChangesAsync();
                }
            }

            if (requestModel.DocumentFiles?.Any() == true)
            {
                foreach (var doc in requestModel.DocumentFiles)
                {
                    doc.EntityId = scrap.Id.Value;
                    doc.EntityType = SpaceLinxEntities.ScrapRequest;

                    await documentService.SaveDocumentAsync(doc);
                }
            }

            await transaction.CommitAsync();

            return Ok(new
            {
                Message = "Scrap Request created successfully",
                ScrapRequestId = scrap.Id
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("scrap-update/{id}")]
    public async Task<IActionResult> UpdateScrapRequest(Guid id, [FromForm] ScrapRequestAlterModel requestModel)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await spaceLinxContext.ScrapRequests
                .Include(r => r.ScrapLineItems)
                .FirstOrDefaultAsync(r => r.Id == id && r.DeletedBy == null);

            if (record == null)
                return NotFound("Scrap Request not found");

            record.LocationId = requestModel.LocationId;
            record.RaisedById = requestModel.RaisedById;
            record.PoId = requestModel.PoId;
            record.GrnId = requestModel.GrnId;
            record.WoId = requestModel.WoId;
            record.ScrapDate = requestModel.ScrapDate;
            record.Reason = requestModel.Reason;
            record.UpdatedBy = UserEmail;
            record.UpdatedAt = DateTime.UtcNow;

            spaceLinxContext.ScrapRequests.Update(record);
            await spaceLinxContext.SaveChangesAsync();

            if (requestModel.ScrapLineItems?.Any() == true)
            {
                foreach (var item in requestModel.ScrapLineItems)
                {
                    var existingItem = await spaceLinxContext.ScrapLineItems
                        .FirstOrDefaultAsync(li => li.Id == item.Id && li.DeletedBy == null);

                    if (existingItem == null)
                    {
                        var newItem = new ScrapLineItem
                        {
                            ScrapRequestId = record.Id.Value,
                            PartId = item.PartId,
                            TrackingType = item.TrackingType,
                            TrackingId = item.TrackingId,
                            ScrapQuantity = item.ScrapQuantity,
                            Reason = item.Reason,
                            CreatedBy = UserEmail,
                            CreatedAt = DateTime.UtcNow
                        };

                        await spaceLinxContext.ScrapLineItems.AddAsync(newItem);
                    }
                    else
                    {
                        existingItem.PartId = item.PartId;
                        existingItem.TrackingType = item.TrackingType;
                        existingItem.TrackingId = item.TrackingId;
                        existingItem.ScrapQuantity = item.ScrapQuantity;
                        existingItem.Reason = item.Reason;
                        existingItem.UpdatedBy = UserEmail;
                        existingItem.UpdatedAt = DateTime.UtcNow;

                        spaceLinxContext.ScrapLineItems.Update(existingItem);
                    }

                    await spaceLinxContext.SaveChangesAsync();
                }
            }

            if (requestModel.DocumentFiles?.Any() == true)
            {
                foreach (var doc in requestModel.DocumentFiles)
                {
                    doc.EntityId = id;
                    doc.EntityType = SpaceLinxEntities.ScrapRequest;

                    await documentService.SaveDocumentAsync(doc);
                }
            }

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("submit/{id}")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var record = await spaceLinxContext.ScrapRequests
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
            return NotFound("Scrap Request not found.");

        record.Status = ScrapRequestStatus.Submitted;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedBy = UserEmail;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var record = await spaceLinxContext.ScrapRequests
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
            return NotFound("Scrap Request not found.");

        record.Status = ScrapRequestStatus.Approved;
        record.ApprovedBy = UserEmail;
        record.ApprovedDate = DateTime.UtcNow;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedBy = UserEmail;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var record = await spaceLinxContext.ScrapRequests
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
            return NotFound("Scrap Request not found.");

        record.Status = ScrapRequestStatus.Rejected;
        record.RejectedBy = UserEmail;
        record.RejectedDate = DateTime.UtcNow;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedBy = UserEmail;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

}