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
public class ContactController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<Contact, ContactWriteModel, ContactUpdateModel, ContactReadModel, ContactRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpPost("company-contact")]
    public async Task<IActionResult> CreateCompanyContact(Guid companyId, ContactDetailWriteModel request)
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

            var contact = mapper.Map<Contact>(request.Contact);
            contact.CompanyId = companyId;
            contact.CreatedBy = UserEmail;
            contact.IsActive = true;

            await spaceLinxContext.Contacts.AddAsync(contact);
            await spaceLinxContext.SaveChangesAsync();

            var companyContact = new CompanyContact
            {
                CompanyId = companyId,
                ContactId = contact.Id.Value,
                ContactType = request.ContactType,
                CreatedBy = UserEmail,
                IsActive = true
            };

            await spaceLinxContext.CompanyContacts.AddAsync(companyContact);
            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { Message = "Company contact created successfully", ContactId = contact.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("company-contact/{companyId}")]
    public async Task<IActionResult> UpdateCompanyContact(Guid companyId, ContactDetailUpdateModel updatedRecord)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var contact = await spaceLinxContext.Contacts.FirstOrDefaultAsync(a => a.Id == updatedRecord.Contact.Id && a.DeletedBy == null);
            if (contact == null)
            {
                return NotFound($"Contact with ID '{updatedRecord.Contact.Id}' not found.");
            }

            mapper.Map(updatedRecord.Contact, contact);
            contact.CompanyId = companyId;
            contact.IsActive = true;
            contact.UpdatedAt = DateTime.UtcNow;
            contact.UpdatedBy = UserEmail;

            spaceLinxContext.Contacts.Update(contact);

            var companyContact = await spaceLinxContext.CompanyContacts
                .FirstOrDefaultAsync(cc => cc.CompanyId == companyId && cc.ContactId == contact.Id && cc.DeletedBy == null);

            if (companyContact == null)
            {
                return NotFound($"CompanyContact with CompanyId '{companyId}' and ContactId '{contact.Id}' not found.");
            }

            companyContact.ContactType = updatedRecord.ContactType;
            companyContact.IsActive = true;
            companyContact.UpdatedAt = DateTime.UtcNow;
            companyContact.UpdatedBy = UserEmail;

            spaceLinxContext.CompanyContacts.Update(companyContact);

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