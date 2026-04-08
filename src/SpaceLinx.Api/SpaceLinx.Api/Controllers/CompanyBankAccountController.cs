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
public class CompanyBankAccountController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<CompanyBankAccount, CompanyBankAccountWriteModel, CompanyBankAccountUpdateModel, CompanyBankAccountReadModel, CompanyBankAccountRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-company/{companyId}")]
    public async Task<IActionResult> GetCompanyBankAccountsByCompanyId(Guid companyId)
    {
        var companyBankAccounts = await spaceLinxContext.CompanyBankAccounts
            .AsNoTracking()
            .Include(x => x.BankAccount)
            .Where(x => x.CompanyId == companyId && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<CompanyBankAccountReadModel>>(companyBankAccounts);
        return Ok(result);
    }
}