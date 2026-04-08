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
public class OrganizationAddressController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<OrganizationAddress, OrganizationAddressWriteModel, OrganizationAddressUpdateModel, OrganizationAddressReadModel, OrganizationAddressRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-organization/{organizationId}")]
    public async Task<IActionResult> GetOrganizationAddressesByOrganizationId(Guid organizationId)
    {
        var organizationAddresses = await spaceLinxContext.OrganizationAddresses
            .AsNoTracking()
            .Include(x => x.Address)
            .Where(x => x.OrganizationId == organizationId && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<OrganizationAddressReadModel>>(organizationAddresses);
        return Ok(result);
    }

    [HttpPost("organization-address")]
    public async Task<IActionResult> CreateOrganizationAddress(Guid organizationId, AddressDetailWriteModel request)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var organization = await spaceLinxContext.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId && o.DeletedBy == null);
            if (organization == null)
            {
                return NotFound($"Organization with ID '{organizationId}' not found.");
            }

            var address = mapper.Map<Address>(request.Address);
            address.CreatedBy = UserEmail;
            address.IsActive = true;

            await spaceLinxContext.Addresses.AddAsync(address);
            await spaceLinxContext.SaveChangesAsync();

            var organizationAddress = new OrganizationAddress
            {
                OrganizationId = organizationId,
                AddressId = address.Id.Value,
                AddressType = request.AddressType,
                CreatedBy = UserEmail,
                IsActive = true
            };

            await spaceLinxContext.OrganizationAddresses.AddAsync(organizationAddress);
            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { Message = "Organization address created successfully", AddressId = address.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("organization-address/{organizationId}")]
    public async Task<IActionResult> UpdateOrganizationAddress(Guid organizationId, AddressDetailUpdateModel updatedRecord)
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

            var organizationAddress = await spaceLinxContext.OrganizationAddresses
                .FirstOrDefaultAsync(oa => oa.OrganizationId == organizationId && oa.AddressId == address.Id && oa.DeletedBy == null);

            if (organizationAddress == null)
            {
                return NotFound($"OrganizationAddress with OrganizationId '{organizationId}' and AddressId '{address.Id}' not found.");
            }

            organizationAddress.AddressType = updatedRecord.AddressType;
            organizationAddress.IsActive = true;
            organizationAddress.UpdatedAt = DateTime.UtcNow;
            organizationAddress.UpdatedBy = UserEmail;

            spaceLinxContext.OrganizationAddresses.Update(organizationAddress);

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