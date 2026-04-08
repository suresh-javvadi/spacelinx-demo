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
public class CompanyPartController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<CompanyPart, CompanyPartWriteModel, CompanyPartUpdateModel, CompanyPartReadModel, CompanyPartRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("company-with-parts")]
    public async Task<IActionResult> GetCompanyParts()
    {
        var records = await spaceLinxContext.CompanyParts
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Part)
            .Where(x => x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<CompanyPartReadModel>>(records);
        return Ok(result);
    }

    [HttpGet("by-company/{companyId}")]
    public async Task<IActionResult> GetCompanyPartByCompanyId(Guid companyId)
    {
        var companyParts = await spaceLinxContext.CompanyParts
            .AsNoTracking()
            .Include(x => x.Part)
            .Where(x => x.CompanyId == companyId && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<CompanyPartReadModel>>(companyParts);
        return Ok(result);
    }
}