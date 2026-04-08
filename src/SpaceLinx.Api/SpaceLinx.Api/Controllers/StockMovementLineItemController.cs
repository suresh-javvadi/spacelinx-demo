using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class StockMovementLineItemController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<StockMovementLineItem, StockMovementLineItemWriteModel, StockMovementLineItemUpdateModel, StockMovementLineItemReadModel, StockMovementLineItemRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-movement/{stockMovementId}")]
    public async Task<IActionResult> GetByMovement(Guid stockMovementId)
    {
        var result = await spaceLinxContext.StockMovementLineItems
            .AsNoTracking()
            .Include(li => li.Part)
            .Where(li => li.StockMovementId == stockMovementId && li.DeletedBy == null)
            .ToListAsync();

        return Ok(mapper.Map<List<StockMovementLineItemReadModel>>(result));
    }
}
