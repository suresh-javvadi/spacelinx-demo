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
public class VendorReturnRequestController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IDocumentService documentService) :
    GenericRestController<VendorReturnRequest, VendorReturnRequestWriteModel, VendorReturnRequestUpdateModel, VendorReturnRequestReadModel, VendorReturnRequestRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("vendor-return-with-user")]
    public async Task<IActionResult> GetVendorReturnWithUser()
    {
        var result = await spaceLinxContext.VendorReturnRequestWithUserVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetVendorReturnRequestDetails(Guid id)
    {
        var record = await spaceLinxContext.VendorReturnRequests
            .AsNoTracking()
            .Where(r => r.Id == id && r.DeletedBy == null)
            .Include(r => r.VendorReturnLineItems)
            .FirstOrDefaultAsync();

        if (record == null)
        {
            return NotFound("Vendor Return Request not found.");
        }

        return Ok(record);
    }

    [HttpPost("vendor-return-details")]
    public async Task<IActionResult> CreateVendorReturnRequest([FromForm] VendorReturnRequestCreateModel requestModel)
    {
        using (var transaction = await spaceLinxContext.Database.BeginTransactionAsync())
        {
            try
            {
                var user = await spaceLinxContext.Users.FirstOrDefaultAsync(x => x.Email == UserEmail && x.DeletedBy == null);

                var vendorReturn = new VendorReturnRequest
                {
                    VendorId = requestModel.VendorId,
                    PoId = requestModel.PoId,
                    GrnId = requestModel.GrnId,
                    WoId = requestModel.WoId,
                    ReturnDate = requestModel.ReturnDate,
                    RaisedById = user.Id.Value,
                    Reason = requestModel.Reason,
                    Status = requestModel.Status,
                    LocationId = requestModel.LocationId,
                    IsActive = true,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow
                };

                spaceLinxContext.VendorReturnRequests.Add(vendorReturn);
                await spaceLinxContext.SaveChangesAsync();

                if (requestModel.VendorReturnRequestItems != null && requestModel.VendorReturnRequestItems.Any())
                {
                    foreach (var item in requestModel.VendorReturnRequestItems)
                    {
                        var lineItem = new VendorReturnLineItem
                        {
                            ReturnRequestId = vendorReturn.Id!.Value,
                            PartId = item.PartId,
                            GrnLineItemId = item.GrnLineItemId,
                            TrackingType = item.TrackingType,
                            TrackingId = item.TrackingId,
                            ReturnQuantity = item.ReturnQuantity,
                            Reason = item.Reason,
                            IsActive = true,
                            CreatedBy = UserEmail,
                            CreatedAt = DateTime.UtcNow
                        };

                        spaceLinxContext.VendorReturnLineItems.Add(lineItem);
                        await spaceLinxContext.SaveChangesAsync();
                    }
                }

                if (requestModel.DocumentFiles != null && requestModel.DocumentFiles.Any())
                {
                    foreach (var doc in requestModel.DocumentFiles)
                    {
                        doc.EntityId = vendorReturn.Id!.Value;
                        doc.EntityType = SpaceLinxEntities.VendorReturnRequest;

                        await documentService.SaveDocumentAsync(doc);
                    }
                }

                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Vendor Return Request created successfully",
                    VendorReturnId = vendorReturn.Id
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    [HttpPut("vendor-return-update/{id}")]
    public async Task<IActionResult> UpdateVendorReturnRequest(Guid id, [FromForm] VendorReturnRequestAlterModel requestModel)
    {
        using (var transaction = await spaceLinxContext.Database.BeginTransactionAsync())
        {
            try
            {
                var record = await spaceLinxContext.VendorReturnRequests
                    .Include(v => v.VendorReturnLineItems)
                    .FirstOrDefaultAsync(v => v.Id == id && v.DeletedBy == null);

                if (record == null)
                    return NotFound("Vendor Return Request not found");

                record.VendorId = requestModel.VendorId;
                record.PoId = requestModel.PoId;
                record.GrnId = requestModel.GrnId;
                record.WoId = requestModel.WoId;
                record.ReturnDate = requestModel.ReturnDate;
                record.RaisedById = requestModel.RaisedById;
                record.Reason = requestModel.Reason;
                record.LocationId = requestModel.LocationId;
                record.UpdatedAt = DateTime.UtcNow;
                record.UpdatedBy = UserEmail;

                spaceLinxContext.VendorReturnRequests.Update(record);
                await spaceLinxContext.SaveChangesAsync();

                if (requestModel.VendorReturnLineItems != null && requestModel.VendorReturnLineItems.Any())
                {
                    foreach (var item in requestModel.VendorReturnLineItems)
                    {
                        var existingLineItem = await spaceLinxContext.VendorReturnLineItems.FirstOrDefaultAsync(li => li.Id == item.Id && li.DeletedBy == null);

                        if (existingLineItem == null)
                        {
                            var newItem = new VendorReturnLineItem
                            {
                                ReturnRequestId = record.Id.Value,
                                PartId = item.PartId,
                                GrnLineItemId = item.GrnLineItemId,
                                TrackingType = item.TrackingType,
                                TrackingId = item.TrackingId,
                                ReturnQuantity = item.ReturnQuantity,
                                Reason = item.Reason,
                                IsActive = true,
                                CreatedBy = UserEmail,
                                CreatedAt = DateTime.UtcNow
                            };

                            await spaceLinxContext.VendorReturnLineItems.AddAsync(newItem);
                            await spaceLinxContext.SaveChangesAsync();
                        }
                        else
                        {
                            existingLineItem.PartId = item.PartId;
                            existingLineItem.GrnLineItemId = item.GrnLineItemId;
                            existingLineItem.TrackingType = item.TrackingType;
                            existingLineItem.TrackingId = item.TrackingId;
                            existingLineItem.ReturnQuantity = item.ReturnQuantity;
                            existingLineItem.Reason = item.Reason;
                            existingLineItem.UpdatedBy = UserEmail;
                            existingLineItem.UpdatedAt = DateTime.UtcNow;

                            spaceLinxContext.VendorReturnLineItems.Update(existingLineItem);
                            await spaceLinxContext.SaveChangesAsync();
                        }
                    }
                }

                await spaceLinxContext.SaveChangesAsync();

                if (requestModel.DocumentFiles != null && requestModel.DocumentFiles.Any())
                {
                    foreach (var doc in requestModel.DocumentFiles)
                    {
                        doc.EntityId = id;
                        doc.EntityType = SpaceLinxEntities.VendorReturnRequest;

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
    }

    [HttpPut("submit/{id}")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var record = await spaceLinxContext.VendorReturnRequests
                      .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        record.Status = VendorReturnRequestStatus.Submitted;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedBy = UserEmail;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }


    [HttpPut("approval/{id}")]
    public async Task<IActionResult> Approval(Guid id)
    {
        var record = await spaceLinxContext.VendorReturnRequests
                      .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        record.Status = VendorReturnRequestStatus.Approved;
        record.ApprovedBy = UserEmail;
        record.ApprovedDate = DateTime.UtcNow;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var record = await spaceLinxContext.VendorReturnRequests
                      .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        record.Status = VendorReturnRequestStatus.Rejected;
        record.RejectedBy = UserEmail;
        record.RejectedDate = DateTime.UtcNow;
        record.UpdatedAt = DateTime.UtcNow;
        record.UpdatedBy = UserEmail;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }
}