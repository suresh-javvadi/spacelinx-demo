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
public class CompanyContactController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<CompanyContact, CompanyContactWriteModel, CompanyContactUpdateModel, CompanyContactReadModel, CompanyContactRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-company/{companyId}")]
    public async Task<IActionResult> GetCompanyContactsByCompanyId(Guid companyId)
    {
        var companyContacts = await spaceLinxContext.CompanyContacts
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Contact)
            .Where(x => x.CompanyId == companyId && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<CompanyContactReadModel>>(companyContacts);
        return Ok(result);
    }
}