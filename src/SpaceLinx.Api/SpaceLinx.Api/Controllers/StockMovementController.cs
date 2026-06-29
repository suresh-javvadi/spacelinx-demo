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
public class StockMovementController(
    SpaceLinxContext spaceLinxContext,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    IStockMovementService stockMovementService) :
    GenericRestController<StockMovement, StockMovementWriteModel, StockMovementUpdateModel, StockMovementReadModel, StockMovementRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("stock-movement-with-user")]
    public async Task<IActionResult> GetStockMovementsWithUser()
    {
        var result = await spaceLinxContext.StockMovementWithUserVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpPost("with-line-items")]
    public async Task<IActionResult> CreateWithLineItems([FromBody] StockMovementWithLineItemsWriteModel request)
    {
        try
        {
            var result = await stockMovementService.CreateStockMovementAsync(request);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, mapper.Map<StockMovementReadModel>(result));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("submit-with-line-items")]
    public async Task<IActionResult> SubmitWithLineItems([FromBody] StockMovementWithLineItemsWriteModel request)
    {
        try
        {
            var result = await stockMovementService.SubmitStockMovementAsync(request);
            return CreatedAtAction(nameof(Get), new { id = result.Id }, mapper.Map<StockMovementReadModel>(result));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetDetails(Guid id)
    {
        var record = await spaceLinxContext.StockMovements
            .AsNoTracking()
            .Include(m => m.FromLocation)
            .Include(m => m.ToLocation)
            .Include(m => m.FromBin)
            .Include(m => m.ToBin)
            .Include(m => m.PerformedBy)
            .Include(m => m.WorkOrder)
            .Include(m => m.Project)
            .Include(m => m.SubProject)
            .Include(m => m.StockMovementLineItems)
                .ThenInclude(li => li.Part)
            .FirstOrDefaultAsync(m => m.Id == id && m.DeletedBy == null);

        if (record == null)
            return NotFound("Stock Movement not found.");

        return Ok(record);
    }

    [HttpGet("by-location/{locationId}")]
    public async Task<IActionResult> GetByLocation(Guid locationId)
    {
        var result = await spaceLinxContext.StockMovements
            .AsNoTracking()
            .Include(m => m.FromLocation)
            .Include(m => m.ToLocation)
            .Include(m => m.PerformedBy)
            .Where(m => (m.FromLocationId == locationId || m.ToLocationId == locationId) && m.DeletedBy == null)
            .OrderByDescending(m => m.MovementDate)
            .ThenByDescending(m => m.CreatedAt)
            .ToListAsync();

        return Ok(mapper.Map<List<StockMovementReadModel>>(result));
    }

    [HttpGet("by-type/{movementType}")]
    public async Task<IActionResult> GetByType(string movementType)
    {
        var result = await spaceLinxContext.StockMovements
            .AsNoTracking()
            .Include(m => m.FromLocation)
            .Include(m => m.ToLocation)
            .Include(m => m.PerformedBy)
            .Where(m => m.MovementType == movementType && m.DeletedBy == null)
            .OrderByDescending(m => m.MovementDate)
            .ThenByDescending(m => m.CreatedAt)
            .ToListAsync();

        return Ok(mapper.Map<List<StockMovementReadModel>>(result));
    }

    [HttpGet("by-part/{partId}")]
    public async Task<IActionResult> GetByPart(Guid partId)
    {
        var result = await spaceLinxContext.StockMovements
            .AsNoTracking()
            .Include(m => m.FromLocation)
            .Include(m => m.ToLocation)
            .Include(m => m.PerformedBy)
            .Include(m => m.StockMovementLineItems)
            .Where(m => m.StockMovementLineItems.Any(li => li.PartId == partId) && m.DeletedBy == null)
            .OrderByDescending(m => m.MovementDate)
            .ThenByDescending(m => m.CreatedAt)
            .ToListAsync();

        return Ok(mapper.Map<List<StockMovementReadModel>>(result));
    }

    [HttpPut("{id}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var success = await stockMovementService.ApproveStockMovementAsync(id);
        if (!success)
            return BadRequest("Cannot approve movement or movement not found.");

        return NoContent();
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var success = await stockMovementService.RejectStockMovementAsync(id);
        if (!success)
            return BadRequest("Cannot reject movement. Movement not found or not in PendingApproval status.");

        return NoContent();
    }

    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        var success = await stockMovementService.CancelStockMovementAsync(id);
        if (!success)
            return BadRequest("Cannot cancel movement or movement not found.");

        return NoContent();
    }
}
