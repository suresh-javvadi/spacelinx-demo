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
public class CompanyAddressController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<CompanyAddress, CompanyAddressWriteModel, CompanyAddressUpdateModel, CompanyAddressReadModel, CompanyAddressRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-company/{companyId}")]
    public async Task<IActionResult> GetCompanyAddressesByCompanyId(Guid companyId)
    {
        var companyAddresses = await spaceLinxContext.CompanyAddresses
            .AsNoTracking()
            .Include(x => x.Address)
            .Where(x => x.CompanyId == companyId && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<CompanyAddressReadModel>>(companyAddresses);
        return Ok(result);
    }
}