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
public class StaffController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService, IImageService imageService) :
    GenericRestController<Staff, StaffWriteModel, StaffUpdateModel, StaffReadModel, StaffRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("by-organization/{organizationId}")]
    public async Task<IActionResult> GetStaffByOrganizationId(Guid organizationId)
    {
        var record = await spaceLinxContext.Staff
            .AsNoTracking()
            .Where(x => x.OrganizationId == organizationId && x.DeletedBy == null)
            .ToListAsync();

        var result = mapper.Map<List<StaffReadModel>>(record);
        return Ok(result);
    }

    [HttpPost("image")]
    public async Task<IActionResult> PostWithImage([FromForm] StaffCreateModel newStaff, [FromForm] ImageWriteModel image)
    {
        var staff = new Staff
        {
            FirstName = newStaff.FirstName,
            LastName = newStaff.LastName,
            Email = newStaff.Email,
            Phone = newStaff.Phone,
            OrganizationId = newStaff.OrganizationId,
            ManagerId = newStaff.ManagerId,
            StaffNumber = newStaff.StaffNumber,
            JobTitle = newStaff.JobTitle,
            EmploymentStartDate = newStaff.EmploymentStartDate,
            EmploymentEndDate = newStaff.EmploymentEndDate,
            ImageUrl = string.Empty,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail,
            IsActive = true
        };

        spaceLinxContext.Staff.Add(staff);
        await spaceLinxContext.SaveChangesAsync();

        if (image.ImageFile != null)
        {
            using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
            try
            {
                var createdImage = await imageService.UploadImageAsync(image, staff.Id.Value, SpaceLinxEntities.Staff);

                staff.ImageUrl = createdImage?.FilePath ?? staff.ImageUrl;

                await spaceLinxContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        var readModel = mapper.Map<StaffReadModel>(staff);
        return CreatedAtAction(nameof(Get), new { id = staff.Id }, readModel);
    }

    [HttpPut("staff-update/{id}")]
    public async Task<IActionResult> StaffUpdate(Guid id, StaffAlterModel staff)
    {
        var record = await spaceLinxContext.Staff
            .FirstOrDefaultAsync(s => s.Id == id && s.DeletedBy == null);
        if (record == null)
        {
            return NotFound();
        }

        record.FirstName = staff.FirstName ?? record.FirstName;
        record.LastName = staff.LastName ?? record.LastName;
        record.Email = staff.Email ?? record.Email;
        record.Phone = staff.Phone ?? record.Phone;
        record.OrganizationId = staff.OrganizationId;
        record.ManagerId = staff.ManagerId;
        record.StaffNumber = staff.StaffNumber;
        record.JobTitle = staff.JobTitle;
        record.EmploymentStartDate = staff.EmploymentStartDate ?? record.EmploymentStartDate;
        record.EmploymentEndDate = staff.EmploymentEndDate ?? record.EmploymentEndDate;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("image/{id}")]
    public async Task<IActionResult> UpdateWithImage(Guid id, [FromForm] ImageWriteModel image)
    {
        var staff = await spaceLinxContext.Staff
            .FirstOrDefaultAsync(s => s.Id == id && s.DeletedBy == null);
        if (staff == null)
        {
            return NotFound();
        }
        if (image.ImageFile != null)
        {
            using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
            try
            {
                var createdImage = await imageService.UploadImageAsync(image, staff.Id.Value, SpaceLinxEntities.Staff);
                staff.ImageUrl = createdImage?.FilePath ?? staff.ImageUrl;
                staff.UpdatedAt = DateTime.UtcNow;
                staff.UpdatedBy = UserEmail;
                await spaceLinxContext.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        var readModel = mapper.Map<StaffReadModel>(staff);
        return Ok(readModel);
    }
}