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
                // qty_available is a stored generated column of pure integer subtraction
                // (qty_onhand - qty_reserved - qty_issued - qty_qc_failed - qty_qc_pending),
                // typed numeric(18,4) only to match the DB. Its value is always whole, so the
                // cast to the int read model is lossless (no fractional component can occur).
                QtyAvailable = (int)(x.QtyAvailable ?? 0),
                QtyReserved = x.QtyReserved ?? 0,
                QtyIssued = x.QtyIssued ?? 0,
                QtyConsumed = x.QtyConsumed ?? 0,
                QtyQcPending = x.QtyQcPending ?? 0,
                QtyQcFailed = x.QtyQcFailed ?? 0,
                QtyScrapped = x.QtyScrapped ?? 0,
                QtyReturned = x.QtyReturned ?? 0,
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