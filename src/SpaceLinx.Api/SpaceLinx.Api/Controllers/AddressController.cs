using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Api.Services;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class AddressController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<Address, AddressWriteModel, AddressUpdateModel, AddressReadModel, AddressRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpPost("company-address")]
    public async Task<IActionResult> CreateCompanyAddress(Guid companyId, AddressDetailWriteModel request)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var company = await spaceLinxContext.Companies
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == companyId && c.DeletedBy == null);
            if (company == null)
            {
                return NotFound($"Company with ID '{companyId}' not found.");
            }

            var address = mapper.Map<Address>(request.Address);
            address.CreatedBy = UserEmail;
            address.IsActive = true;

            await spaceLinxContext.Addresses.AddAsync(address);
            await spaceLinxContext.SaveChangesAsync();

            var companyAddress = new CompanyAddress
            {
                CompanyId = companyId,
                AddressId = address.Id.Value,
                AddressType = request.AddressType,
                CreatedBy = UserEmail,
                IsActive = true
            };

            await spaceLinxContext.CompanyAddresses.AddAsync(companyAddress);
            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { Message = "Company address created successfully", AddressId = address.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("company-address/{companyId}")]
    public async Task<IActionResult> UpdateCompanyAddress(Guid companyId, AddressDetailUpdateModel updatedRecord)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var address = await spaceLinxContext.Addresses.FirstOrDefaultAsync(a => a.Id == updatedRecord.Address.Id && a.DeletedBy == null);
            if (address == null)
            {
                return NotFound($"Address with ID '{updatedRecord.Address.Id}' not found.");
            }

            mapper.Map(updatedRecord.Address, address);
            address.IsActive = true;
            address.UpdatedAt = DateTime.UtcNow;
            address.UpdatedBy = UserEmail;

            spaceLinxContext.Addresses.Update(address);

            var companyAddress = await spaceLinxContext.CompanyAddresses
                .FirstOrDefaultAsync(ca => ca.CompanyId == companyId && ca.AddressId == address.Id && ca.DeletedBy == null);

            if (companyAddress == null)
            {
                return NotFound($"CompanyAddress with CompanyId '{companyId}' and AddressId '{address.Id}' not found.");
            }

            companyAddress.AddressType = updatedRecord.AddressType;
            companyAddress.IsActive = true;
            companyAddress.UpdatedAt = DateTime.UtcNow;
            companyAddress.UpdatedBy = UserEmail;

            spaceLinxContext.CompanyAddresses.Update(companyAddress);

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}