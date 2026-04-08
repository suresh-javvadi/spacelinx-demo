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
public class BankAccountController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<BankAccount, BankAccountWriteModel, BankAccountUpdateModel, BankAccountReadModel, BankAccountRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpPost("company-bank-account")]
    public async Task<IActionResult> CreateCompanyBankAccount(Guid companyId, BankAccountDetailWriteModel request)
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

            var bankAccount = mapper.Map<BankAccount>(request.BankAccount);
            bankAccount.CreatedBy = UserEmail;
            bankAccount.IsActive = true;

            await spaceLinxContext.BankAccounts.AddAsync(bankAccount);
            await spaceLinxContext.SaveChangesAsync();

            var companyBankAccount = new CompanyBankAccount
            {
                CompanyId = companyId,
                BankAccountId = bankAccount.Id.Value,
                CreatedBy = UserEmail,
                IsActive = true
            };

            await spaceLinxContext.CompanyBankAccounts.AddAsync(companyBankAccount);
            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { Message = "Company bank account created successfully", BankAccountId = bankAccount.Id });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("company-bank-account/{companyId}")]
    public async Task<IActionResult> UpdateCompanyBankAccount(Guid companyId, BankAccountDetailUpdateModel updatedRecord)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var bankAccount = await spaceLinxContext.BankAccounts.FirstOrDefaultAsync(a => a.Id == updatedRecord.BankAccount.Id && a.DeletedBy == null);
            if (bankAccount == null)
            {
                return NotFound($"BankAccount with ID '{updatedRecord.BankAccount.Id}' not found.");
            }

            mapper.Map(updatedRecord.BankAccount, bankAccount);
            bankAccount.IsActive = true;
            bankAccount.UpdatedAt = DateTime.UtcNow;
            bankAccount.UpdatedBy = UserEmail;

            spaceLinxContext.BankAccounts.Update(bankAccount);

            var companyBankAccount = await spaceLinxContext.CompanyBankAccounts
                .FirstOrDefaultAsync(cb => cb.CompanyId == companyId && cb.BankAccountId == bankAccount.Id && cb.DeletedBy == null);

            if (companyBankAccount == null)
            {
                return NotFound($"CompanyBankAccount with VendorId '{companyId}' and BankAccountId '{bankAccount.Id}' not found.");
            }

            companyBankAccount.IsActive = true;
            companyBankAccount.UpdatedAt = DateTime.UtcNow;
            companyBankAccount.UpdatedBy = UserEmail;

            spaceLinxContext.CompanyBankAccounts.Update(companyBankAccount);

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