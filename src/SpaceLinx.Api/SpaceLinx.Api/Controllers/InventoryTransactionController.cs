using System.Linq.Dynamic.Core;
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
public class InventoryTransactionController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<InventoryTransaction, InventoryTransactionWriteModel, InventoryTransactionUpdateModel, InventoryTransactionReadModel, InventoryTransactionRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("InventoryTransactions/{partId}")]
    public async Task<List<InventoryTransactionReadModel>> GetByPart(Guid partId)
    {
        var records = await spaceLinxContext.InventoryTransactions
            .AsNoTracking()
            .Include(x => x.Part)
            .Include(x => x.ToLocation)
            .Include (x => x.FromLocation)
            .Where(x  => x.PartId == partId && x.DeletedBy == null)
            .ToListAsync();

        if (records == null)
        {
            throw new ApplicationException("No InventoryTransactions found");
        }

        return mapper.Map<List<InventoryTransaction>, List<InventoryTransactionReadModel>>(records);
    }

    [HttpGet("InventoryTransactions-details")]
    public async Task<IActionResult> GetInventoryTransactions()
    {
        var result = await spaceLinxContext.InventoryTransactionVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("InventoryTransactions-details/{partId}")]
    public async Task<IActionResult> GetInventoryTransactionsByPart(Guid partId)
    {
        var result = await spaceLinxContext.InventoryTransactionVws
            .AsNoTracking()
            .Where(x => x.PartId == partId) 
            .ToListAsync();

        return Ok(result);
    }
}