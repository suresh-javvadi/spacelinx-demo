using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Graph.Models;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Api.Services;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class InventoryPartController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService, IInventoryNotificationService inventoryNotificationService) :
    GenericRestController<InventoryPart, InventoryPartWriteModel, InventoryPartUpdateModel, InventoryPartReadModel, InventoryPartRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("inventory-parts")]
    public async Task<IActionResult> GetInventoryPart()
    {
        var result = await spaceLinxContext.InventoryPartVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("inventory-goods")]
    public async Task<IActionResult> GetInventoryGoods()
    {
        var result = await spaceLinxContext.InventoryGoodsVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("inventory-services")]
    public async Task<IActionResult> GetInventoryServices()
    {
        var result = await spaceLinxContext.InventoryServicesVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("inventory-part_price")]
    public async Task<IActionResult> GetInventoryPartPrice()
    {
        var result = await spaceLinxContext.InventoryPartPriceVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("inventory-part-details/{partId}")]
    public async Task<IActionResult> GetInventoryDetailsForPart(Guid partId)
    {
        var partInfo = await spaceLinxContext.InventoryParts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PartId == partId && p.DeletedBy == null);

        if (partInfo == null)
        {
            return NotFound(new { Message = $"No part found with PartId: {partId}" });
        }

        var stockInfo = await spaceLinxContext.InventoryStocks
            .AsNoTracking()
            .Include(s => s.Location)
            .Include(s => s.Bin)
            .Where(s => s.PartId == partId && s.DeletedBy == null)
            .ToListAsync();

        var response = new
        {
            Part = mapper.Map<InventoryPartReadModel>(partInfo),
            Stock = mapper.Map<List<InventoryStockReadModel>>(stockInfo)
        };

        return Ok(response);
    }

    [HttpGet("inventory-parts/by-location/{locationId}")]
    public async Task<IActionResult> GetInventoryPartsByLocation(Guid locationId)
    {
        var inventoryParts = await spaceLinxContext.InventoryParts
            .AsNoTracking()
            .Where(p => p.LocationId == locationId && p.DeletedBy == null)
            .Select(p => new InventoryPartReadModel
            {
                Id = p.Id,
                PartId = p.PartId,
                LocationId = p.LocationId,
                BinId = p.BinId,
                SkuCode = p.SkuCode,
                UnitPrice = p.UnitPrice,
                ReorderLevel = p.ReorderLevel,
                QtyOnhand = p.QtyOnhand,
                QtyReserved = p.QtyReserved,
                QtyAvailable = p.QtyAvailable,
                ConsumedQuantity = p.ConsumedQuantity,
                QtyIssued = p.QtyIssued,
                QtyQcPending = p.QtyQcPending,
                QtyScrapped = p.QtyScrapped,
                QtyQcFailed = p.QtyQcFailed,
                QtyReturned = p.QtyReturned,
                TrackingType = p.TrackingType,
                Part = new PartRefModel
                {
                    Name = p.Part!.Name,
                    PartNumberSuffix = p.Part.PartNumberSuffix,
                    Version = p.Part.Version,
                    PartNumber = p.Part.PartNumber,
                    Status = p.Part.Status,
                    MakeBuy = p.Part.MakeBuy,
                    IsSerialNumberRequired = p.Part.IsSerialNumberRequired,
                    UnitPrice = p.Part.UnitPrice,
                    ManufacturingPartNumber = p.Part.ManufacturingPartNumber,
                    ManufacturerName = p.Part.ManufacturerName
                }
            })
            .ToListAsync();

        return Ok(inventoryParts);
    }


    [HttpGet("inventory-parts/{partId}/tracking-ids/{movementType}")]
    public async Task<IActionResult> GetTrackingIdsAsync(Guid partId, string movementType)
    {
        var validMovementTypes = new[]
        {
        StockMovementType.Reserved,
        StockMovementType.Issued,
        StockMovementType.Consumed,
        StockMovementType.VendorReturn,
        StockMovementType.Scrap,
        StockMovementType.Adjustment
        };

        if (!validMovementTypes.Contains(movementType))
        {
            return BadRequest($"Invalid movement type: {movementType}");
        }

        var query = spaceLinxContext.InventoryStocks
            .AsNoTracking()
            .Where(x => x.PartId == partId && x.DeletedBy == null);

        query = movementType switch
        {
            StockMovementType.Reserved =>
                query.Where(x => x.QtyAvailable > 0),

            StockMovementType.Issued =>
                query.Where(x => x.QtyAvailable > 0 ||
                                 x.QtyReserved > 0),

            StockMovementType.Consumed =>
                query.Where(x => x.QtyAvailable > 0 ||
                                 x.QtyReserved > 0 ||
                                 x.QtyIssued > 0),

            StockMovementType.VendorReturn or StockMovementType.Scrap =>
                query.Where(x => x.QtyAvailable > 0 ||
                                 x.QtyReserved > 0 ||
                                 x.QtyIssued > 0 ||
                                 x.QtyQcFailed > 0),

            StockMovementType.Adjustment =>
                query.Where(x => x.QtyAvailable > 0),

            _ => query
        };

        var trackingIds = await query
            .Where(x => x.TrackingId != null)
            .Select(x => x.TrackingId!)
            .Distinct()
            .ToListAsync();

        return Ok(trackingIds);
    }

    [HttpPut("inventory-part-Update/{PartId}")]
    public async Task<IActionResult> UpdateInventoryStocks(Guid PartId, InventoryPartAlterModel request)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        {
            try
            {
                if (request == null)
                    return BadRequest("Request cannot be null.");
                if (request.InventoryStocks == null || !request.InventoryStocks.Any())
                    return BadRequest("At least one InventoryStock entry is required.");
                if (request.UnitPrice < 0)
                    return BadRequest("Unit price cannot be negative.");
                if (request.QtyReserved < 0)
                    return BadRequest("QtyReserved cannot be negative.");
                if (request.ReorderLevel < 0)
                    return BadRequest("ReorderLevel cannot be negative.");

                var now = DateTime.UtcNow;
                var newStockItems = new List<InventoryStock>();

                foreach (var item in request.InventoryStocks)
                {
                    var existingStock = await spaceLinxContext.InventoryStocks
                        .FirstOrDefaultAsync(s =>
                            s.PartId == PartId &&
                            s.LocationId == item.LocationId &&
                            s.BinId == item.BinId &&
                            s.DeletedBy == null);

                    if (existingStock != null)
                    {
                        var oldQty = existingStock.QtyOnhand;
                        var qtyDiff = item.QtyOnhand - oldQty;

                        existingStock.BinId = item.BinId;
                        existingStock.LocationId = item.LocationId;
                        existingStock.QtyOnhand = item.QtyOnhand;
                        existingStock.UpdatedBy = UserEmail;
                        existingStock.UpdatedAt = now;

                        if (qtyDiff != 0)
                        {
                            spaceLinxContext.InventoryTransactions.Add(new InventoryTransaction
                            {
                                PartId = PartId,
                                FromLocationId = item.LocationId,
                                ToLocationId = item.LocationId,
                                TransactionType = "Adjustment",
                                PreviousQuantity = oldQty,
                                CurrentQuantity = item.QtyOnhand,
                                TransactedQuantity = qtyDiff,
                                TransactionDate = now,
                                CreatedBy = UserEmail,
                                CreatedAt = now,
                                IsActive = true,
                                Notes = $"Updated quantity to {item.QtyOnhand}."
                            });

                            await spaceLinxContext.SaveChangesAsync();
                        }
                    }
                    else
                    {
                        newStockItems.Add(new InventoryStock
                        {
                            PartId = PartId,
                            LocationId = item.LocationId,
                            BinId = item.BinId,
                            QtyOnhand = item.QtyOnhand,
                            TrackingType = item.TrackingType,
                            TrackingId = item.TrackingId,
                            ProjectId = item.ProjectId,
                            AssignedUserId = item.AssignedUserId,
                            CreatedBy = UserEmail,
                            CreatedAt = now,
                            IsActive = true
                        });

                        spaceLinxContext.InventoryTransactions.Add(new InventoryTransaction
                        {
                            PartId = PartId,
                            FromLocationId = item.LocationId,
                            ToLocationId = item.LocationId,
                            TransactionType = "Adjustment",
                            PreviousQuantity = 0,
                            CurrentQuantity = item.QtyOnhand,
                            TransactedQuantity = item.QtyOnhand,
                            TransactionDate = now,
                            CreatedBy = UserEmail,
                            CreatedAt = now,
                            IsActive = true,
                            Notes = $"Updated quantity to {item.QtyOnhand}."
                        });

                        await spaceLinxContext.SaveChangesAsync();
                    }
                }

                if (newStockItems.Any())
                    await spaceLinxContext.InventoryStocks.AddRangeAsync(newStockItems);

                await spaceLinxContext.SaveChangesAsync();

                var totalStockQty = await spaceLinxContext.InventoryStocks
                    .Where(s => s.PartId == PartId && s.DeletedBy == null)
                    .SumAsync(s => s.QtyOnhand);

                var part = await spaceLinxContext.InventoryParts
                    .FirstOrDefaultAsync(p => p.PartId == PartId && p.DeletedBy == null);

                if (part != null)
                {
                    part.SkuCode = request.SkuCode;
                    part.UnitPrice = request.UnitPrice;
                    part.QtyOnhand = totalStockQty;
                    part.QtyReserved = request.QtyReserved;
                    part.ReorderLevel = request.ReorderLevel;
                    part.UpdatedAt = now;
                    part.UpdatedBy = UserEmail;

                    var QtyAvailable = part.QtyOnhand - part.QtyReserved - part.QtyIssued - part.QtyQcFailed - part.QtyQcPending;

                    if (part.QtyAvailable <= part.ReorderLevel)
                    {
                        await inventoryNotificationService.NotifyReorderLevelAsync(part.Id.Value);
                    }
                }
                else
                {
                    spaceLinxContext.InventoryParts.Add(new InventoryPart
                    {
                        PartId = PartId,
                        SkuCode = request.SkuCode,
                        UnitPrice = request.UnitPrice,
                        QtyOnhand = totalStockQty,
                        QtyReserved = request.QtyReserved,
                        QtyAvailable = request.QtyAvailable,
                        ReorderLevel = request.ReorderLevel,
                        CreatedAt = now,
                        CreatedBy = UserEmail,
                        IsActive = true
                    });
                }

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

    [HttpPut("inventory-part-update-details/{PartId}")]
    public async Task<IActionResult> UpdateInventoryPartDetails(Guid PartId, [FromBody] InventoryPartDetailsUpdateModel request)
    {

        var part = await spaceLinxContext.InventoryParts
            .FirstOrDefaultAsync(p => p.PartId == PartId && p.DeletedBy == null);

        if (part == null)
            return NotFound($"No inventory part found with ID {PartId}");

        part.SkuCode = request.SkuCode;
        part.UnitPrice = request.UnitPrice;
        part.ReorderLevel = request.ReorderLevel;
        part.UpdatedAt = DateTime.UtcNow;
        part.UpdatedBy = UserEmail;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("purchase-history/{partId}")]
    public async Task<IActionResult> GetPurchaseHistory(Guid partId)
    {
        var purchaseHistory = await spaceLinxContext.PurchaseHistoryVws
            .AsNoTracking()
            .Where(x => x.PartId == partId)
            .OrderByDescending(x => x.ReceivedDate)
            .ToListAsync();

        return Ok(purchaseHistory);
    }

    [HttpGet("issue-history/{partId}")]
    public async Task<IActionResult> GetIssueHistory(Guid partId)
    {
        var issueHistory = await spaceLinxContext.IssueHistoryVws
            .AsNoTracking()
            .Where(x => x.PartId == partId)
            .OrderByDescending(x => x.IssuedDate)
            .ToListAsync();

        return Ok(issueHistory);
    }
}