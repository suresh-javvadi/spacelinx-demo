using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class InventoryStockReportController(SpaceLinxContext spaceLinxContext) : ControllerBase
{
    /// <summary>
    /// Inventory stock movement report (opening / purchase / consumption / closing balance)
    /// for a date window. Backed by sc.inventory_stock_report(p_start, p_end, p_part_id).
    /// </summary>
    /// <param name="from">Period start date (inclusive). Required.</param>
    /// <param name="to">Period end date (inclusive). Required.</param>
    /// <param name="partId">Optional part filter. When omitted, all parts are returned.</param>
    [HttpGet("stock-report")]
    public async Task<IActionResult> GetStockReport(
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] Guid? partId,
        CancellationToken cancellationToken)
    {
        if (from is null || to is null)
        {
            return BadRequest("Both 'from' and 'to' dates are required.");
        }

        if (to < from)
        {
            return BadRequest("'to' date must be on or after 'from' date.");
        }

        var startParam = new NpgsqlParameter("p_start", NpgsqlDbType.Date) { Value = from.Value };
        var endParam = new NpgsqlParameter("p_end", NpgsqlDbType.Date) { Value = to.Value };
        var partParam = new NpgsqlParameter("p_part_id", NpgsqlDbType.Uuid) { Value = (object?)partId ?? DBNull.Value };

        var rows = await spaceLinxContext.InventoryStockReportRows
            .FromSqlRaw("SELECT * FROM sc.inventory_stock_report(@p_start, @p_end, @p_part_id)",
                startParam, endParam, partParam)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Ok(rows);
    }
}
