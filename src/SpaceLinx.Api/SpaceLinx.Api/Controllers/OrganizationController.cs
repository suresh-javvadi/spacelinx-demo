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
public class OrganizationController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService, IImageService imageService) :
    GenericRestController<Organization, OrganizationWriteModel, OrganizationUpdateModel, OrganizationReadModel, OrganizationRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("Organization-With-Address")]
    public async Task<IActionResult> GetWithAddress()
    {
        var record = await spaceLinxContext.Organizations
            .AsNoTracking()
            .Include(x => x.OrganizationAddresses
            .Where(oa => oa.DeletedBy == null))
            .ThenInclude(x => x.Address)
            .Where(x => x.DeletedBy == null)
            .ToListAsync();

        return Ok(record);
    }

    [HttpPost("image")]
    public async Task<IActionResult> PostWithImage([FromForm] OrganizationCreateModel newOrganization, [FromForm] ImageWriteModel image)
    {
        var organization = new Organization
        {
            Name = newOrganization.Name,
            Category = newOrganization.Category,
            Description = newOrganization.Description,
            TaxNumber = newOrganization.TaxNumber,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail,
            IsActive = true
        };

        spaceLinxContext.Organizations.Add(organization);
        await spaceLinxContext.SaveChangesAsync();

        if (image.ImageFile != null)
        {
            using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
            try
            {
                var createdImage = await imageService.UploadImageAsync(image, organization.Id.Value, SpaceLinxEntities.Organization);

                organization.ImageUrl = createdImage?.FilePath ?? organization.ImageUrl;

                await spaceLinxContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        var readModel = mapper.Map<OrganizationReadModel>(organization);
        return CreatedAtAction(nameof(Get), new { id = organization.Id }, readModel);
    }

    [HttpPut("organization-update/{id}")]
    public async Task<IActionResult> OrganizationUpdate(Guid id, OrganizationAlterModel organization)
    {
        var record = await spaceLinxContext.Organizations
            .FirstOrDefaultAsync(o => o.Id == id && o.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        record.Name = organization.Name;
        record.Category = organization.Category;
        record.Description = organization.Description;
        record.TaxNumber = organization.TaxNumber;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("image/{id}")]
    public async Task<IActionResult> UpdateWithImage(Guid id, [FromForm] OrganizationAlterModel updateOrganization, [FromForm] ImageWriteModel image)
    {
        var record = await spaceLinxContext.Organizations
            .FirstOrDefaultAsync(o => o.Id == id && o.DeletedBy == null);
        if (record == null)
        {
            return NotFound($"Organization with ID '{id}' not found.");
        }

        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            record.Name = updateOrganization.Name;
            record.Category = updateOrganization.Category;
            record.Description = updateOrganization.Description;
            record.TaxNumber = updateOrganization.TaxNumber;
            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = UserEmail;

            if (image.ImageFile != null)
            {
                var createdImage = await imageService.UploadImageAsync(image, record.Id.Value, SpaceLinxEntities.Organization);
                record.ImageUrl = createdImage?.FilePath ?? record.ImageUrl;
            }
            else if (!string.IsNullOrWhiteSpace(record.ImageUrl))
            {
                var existingImage = await spaceLinxContext.Images
                    .FirstOrDefaultAsync(i => i.FileRelativePath == record.ImageUrl && i.DeletedBy == null);

                if (existingImage != null)
                    await imageService.RemoveImageAsync(existingImage);

                record.ImageUrl = null;
            }

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

    [HttpDelete("organization-{id}")]
    public async Task<IActionResult> DeleteOrganization(Guid id)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var organization = await spaceLinxContext.Organizations
            .Include(o => o.OrganizationAddresses)
            .FirstOrDefaultAsync(o => o.Id == id);

            if (organization == null)
            {
                return NotFound($"Organization with ID {id} not found.");
            }

            if (organization.OrganizationAddresses?.Any() == true)
            {
                foreach (var li in organization.OrganizationAddresses)
                {
                    li.DeletedAt = DateTime.UtcNow;
                    li.DeletedBy = UserEmail;
                    li.IsActive = false;
                }
            }

            await RemoveAsync(id);

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Internal server error");
        }
    }
}