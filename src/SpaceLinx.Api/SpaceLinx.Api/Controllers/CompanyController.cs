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
public class CompanyController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<Company, CompanyWriteModel, CompanyUpdateModel, CompanyReadModel, CompanyRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("vendors")]
    public async Task<IActionResult> GetVendors()
    {
        var vendors = await spaceLinxContext.Companies
            .AsNoTracking()
            .Include(x => x.PaymentTerm)
            .Include(x => x.Currency)
            .Where(x => x.IsVendor == true && x.DeletedBy == null)
            .ToListAsync();

        return Ok(vendors);
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        var customers = await spaceLinxContext.Companies
            .AsNoTracking()
            .Include(x => x.PaymentTerm)
            .Include(x => x.Currency)
            .Where(x => x.IsCustomer == true && x.DeletedBy == null)
            .ToListAsync();

        return Ok(customers);
    }

    [HttpGet("partners")]
    public async Task<IActionResult> GetPartners()
    {
        var partners = await spaceLinxContext.Companies
            .AsNoTracking()
            .Include(x => x.PaymentTerm)
            .Include(x => x.Currency)
            .Where(x => x.IsPartner == true && x.DeletedBy == null)
            .ToListAsync();

        return Ok(partners);
    }

    [HttpGet("company-with-organization")]
    public async Task<IActionResult> GetCompanyWithOrganization()
    {
        var result = await spaceLinxContext.CompanyWithOrganizationVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async override Task<ActionResult<CompanyReadModel>> Get(Guid id)
    {
        var company = await spaceLinxContext.Companies
        .AsNoTracking()
        .Include(v => v.PaymentTerm)
        .Include(v => v.Currency)
        .FirstOrDefaultAsync(c => c.Id == id && c.DeletedBy == null);

        if (company == null)
            return NotFound();

        var result = mapper.Map<CompanyReadModel>(company);
        return Ok(result);
    }

    [HttpGet("vendor/{id}")]
    public async Task<ActionResult<CompanyReadModel>> GetVendorById(Guid id)
    {
        var vendor = await spaceLinxContext.Companies
        .AsNoTracking()
        .Include(x => x.PaymentTerm)
        .Include(x => x.Currency)
        .FirstOrDefaultAsync(c => c.Id == id && c.IsVendor == true && c.DeletedBy == null);

        if (vendor == null)
            return NotFound();

        var result = mapper.Map<CompanyReadModel>(vendor);
        return Ok(result);
    }

    [HttpGet("customer/{id}")]
    public async Task<ActionResult<CompanyReadModel>> GetCustomerById(Guid id)
    {
        var customer = await spaceLinxContext.Companies
        .AsNoTracking()
        .Include(x => x.PaymentTerm)
        .Include(x => x.Currency)
        .FirstOrDefaultAsync(c => c.Id == id && c.IsCustomer == true && c.DeletedBy == null);

        if (customer == null)
            return NotFound();

        var result = mapper.Map<CompanyReadModel>(customer);
        return Ok(result);
    }

    [HttpGet("partner/{id}")]
    public async Task<ActionResult<CompanyReadModel>> GetPartnerById(Guid id)
    {
        var partner = await spaceLinxContext.Companies
        .AsNoTracking()
        .Include(x => x.PaymentTerm)
        .Include(x => x.Currency)
        .FirstOrDefaultAsync(c => c.Id == id && c.IsPartner == true && c.DeletedBy == null);

        if (partner == null)
            return NotFound();

        var result = mapper.Map<CompanyReadModel>(partner);
        return Ok(result);
    }
}