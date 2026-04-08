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
public class InventoryStockController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<InventoryStock, InventoryStockWriteModel, InventoryStockUpdateModel, InventoryStockReadModel, InventoryStockRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("inventory/by-location/{locationId}")]
    public async Task<IActionResult> GetInventoryByLocation(Guid locationId)
    {
        var result = await spaceLinxContext.InventoryStocks
            .AsNoTracking()
            .Where(x => x.LocationId == locationId && x.DeletedBy == null)
            .Select(x => new InventoryStockDetailsReadModel
            {
                Id = x.Id,
                PartId = x.PartId,
                PartNumber = x.Part.PartNumber!,
                PartName = x.Part.Name,
                BinId = x.BinId,
                BinCode = x.Bin != null ? x.Bin.BinCode : null,
                TrackingType = x.TrackingType,
                TrackingId = x.TrackingId,
                QtyOnhand = x.QtyOnhand,
                QtyAvailable = x.QtyAvailable,
                QtyReserved = x.QtyReserved,
                QtyConsumed = x.QtyConsumed,
                QtyQcPending = x.QtyQcPending,
                QtyQcFailed = x.QtyQcFailed,
                QtyScrapped = x.QtyScrapped,
                QtyReturned = x.QtyReturned,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                CreatedBy = x.CreatedBy,
                UpdatedAt = x.UpdatedAt,
                UpdatedBy = x.UpdatedBy,
                DeletedAt = x.DeletedAt,
                DeletedBy = x.DeletedBy
            })
            .ToListAsync();

        return Ok(result);
    }
}