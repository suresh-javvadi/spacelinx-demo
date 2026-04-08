using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class UserController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<User, UserWriteModel, UserUpdateModel, UserReadModel, UserRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("user-details")]
    public async Task<IActionResult> GetUser()
    {
        var user = await spaceLinxContext.Users.AsNoTracking()
                    .Include(x => x.UserRoles.Where(ur => ur.Role.App.AppName == AppName))
                    .ThenInclude(x => x.Role)
                    .ThenInclude(x => x.RolePermissions)
                    .FirstOrDefaultAsync(x => x.Email.ToLower() == UserEmail && x.DeletedBy == null);

        if (user == null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpGet("app/{applicationId}")]
    public async Task<IActionResult> GetUsersByApp(Guid applicationId)
    {
        var users = await spaceLinxContext.Users.AsNoTracking()
                           .Include(x => x.UserRoles.Where(ur => ur.Role.AppId == applicationId))
                           .ThenInclude(x => x.Role)
                           .Where(x => x.DeletedBy == null && x.UserRoles.Any(ur => ur.Role.AppId == applicationId && ur.DeletedBy == null))
                           .ToListAsync();

        return Ok(userService.UserDetails(mapper, users));
    }

    [HttpGet("app-name")]
    public async Task<IActionResult> GetUsersByAppName()
    {
        var users = await spaceLinxContext.Users.AsNoTracking()
                           .Include(x => x.UserRoles.Where(ur => ur.Role.App.AppName == AppName))
                           .ThenInclude(x => x.Role)
                           .Where(x => x.DeletedBy == null && x.UserRoles.Any(ur => ur.Role.App.AppName == AppName && ur.DeletedBy == null))
                           .ToListAsync();

        return Ok(userService.UserDetails(mapper, users));
    }

    [HttpGet("user/{email}")]
    public async Task<IActionResult> GetUserByEmail(string email)
    {
        var user = await spaceLinxContext.Users.AsNoTracking()
                    .Include(x => x.UserRoles.Where(ur => ur.Role.App.AppName == AppName))
                    .ThenInclude(x => x.Role)
                    .ThenInclude(x => x.RolePermissions)
                    .Where(x => x.DeletedBy == null && x.UserRoles.Any(ur => ur.Role.App.AppName == AppName && ur.DeletedBy == null))
                    .FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());

        if (user == null)
        {
            return NotFound();
        }

        var userDetails = await userService.MapUserDetail(mapper, user, AppName);

        return Ok(userDetails);
    }

    [HttpGet("with-roles")]
    public async Task<List<UserDetailWithUserRoleReadModel>> GetUsersWithRoles()
    {
        var users = await spaceLinxContext.Users.AsNoTracking()
                        .Include(x => x.UserRoles.Where(ur => ur.Role.App.AppName == AppName))
                        .ThenInclude(x => x.Role)
                        .Where(x => x.DeletedBy == null)
                        .ToListAsync();

        return userService.UserDetailsWithUserRole(mapper, users);
    }

    [HttpGet("role/{roleId}")]
    public async Task<IActionResult> GetUsersByRole(Guid roleId)
    {
        var users = await spaceLinxContext.Users
                     .AsNoTracking()
                     .Where(u => u.DeletedBy == null && u.UserRoles.Any(ur => ur.RoleId == roleId && ur.DeletedBy == null))
                     .ToListAsync();

        return Ok(users);
    }

    [HttpPost("with-roles")]
    public async Task<IActionResult> CreateUserWithRoles(UserWriteModel newRecord)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            newRecord.Email = newRecord.Email.ToLowerInvariant();
            Guid userId;
            User? record = null;

            var existingUser = await spaceLinxContext.Users
                .Include(u => u.UserRoles)
                .FirstOrDefaultAsync(u => u.Email == newRecord.Email && u.DeletedBy == null);

            if (existingUser != null)
            {
                foreach (var role in newRecord.Roles)
                {
                    if (role != null)
                    {
                        var existingUserRole = existingUser.UserRoles
                            .FirstOrDefault(ur => ur.RoleId == role.Id && ur.DeletedBy == null);

                        if (existingUserRole == null)
                        {
                            var userRole = new UserRole
                            {
                                RoleId = role.Id,
                                UserId = existingUser.Id.Value,
                                CreatedBy = UserEmail,
                                IsActive = true
                            };

                            spaceLinxContext.UserRoles.Add(userRole);
                        }
                    }
                }
                userId = existingUser.Id.Value;
            }
            else
            {
                record = mapper.Map<User>(newRecord);
                Guid newGuid = Guid.NewGuid();
                record.Id = newGuid;
                record.IsActive = true;
                record.CreatedBy = UserEmail;

                foreach (var role in newRecord.Roles)
                {
                    if (role != null)
                    {
                        var userRole = new UserRole
                        {
                            RoleId = role.Id,
                            UserId = newGuid,
                            CreatedBy = UserEmail,
                            IsActive = true,
                        };

                        record.UserRoles.Add(userRole);
                    }
                }

                spaceLinxContext.Users.Add(record);
                userId = newGuid;
            }

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            var recordFromDb = await spaceLinxContext.Users
                .Include(x => x.UserRoles)
                .ThenInclude(x => x.Role)
                .SingleAsync(x => x.Id == userId);

            var userDetails = await userService.MapUserDetail(mapper, recordFromDb, AppName);

            return Ok(userDetails);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("with-roles/{id}")]
    public async Task<IActionResult> UpdateUserWithRoles(Guid id, UserUpdateModel updatedRecord)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var recordFromDatabase = await spaceLinxContext.Users
                            .Include(x => x.UserRoles)
                            .ThenInclude(ur => ur.Role)
                            .SingleAsync(x => x.Id == id && x.DeletedBy == null);

            var app = await spaceLinxContext.Apps
            .Where(x => x.AppName == AppName && x.DeletedBy == null)
            .FirstOrDefaultAsync();

            if (recordFromDatabase == null || app == null)

            {
                return NotFound();
            }

            updatedRecord.Id = id;
            recordFromDatabase = mapper.Map<UserUpdateModel, User>(updatedRecord, recordFromDatabase);
            recordFromDatabase.UpdatedBy = UserEmail;
            recordFromDatabase.UpdatedAt = DateTime.UtcNow;

            var rolesToRemove = recordFromDatabase.UserRoles
                                .Where(ur => ur.Role.AppId == app.Id && ur.DeletedBy == null)
                                .ToList();
            foreach (var role in rolesToRemove)
            {
                recordFromDatabase.UserRoles.Remove(role);
            }

            recordFromDatabase.UserRoles.Clear();
            foreach (var role in updatedRecord.Roles)
            {
                if (role?.Id != Guid.Empty && role.AppId == app.Id)
                {
                    var validRole = await spaceLinxContext.Roles
                                        .Where(r => r.Id == role.Id && r.AppId == app.Id && r.DeletedBy == null)
                                        .FirstOrDefaultAsync();

                    if (validRole != null)
                    {
                        var userRole = new UserRole
                        {
                            RoleId = role.Id.Value,
                            UserId = id,
                            IsActive = true,
                            CreatedBy = UserEmail
                        };

                        recordFromDatabase.UserRoles.Add(userRole);
                    }
                }
            }

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            var recordFromDb = await spaceLinxContext.Users
                            .Include(x => x.UserRoles)
                            .ThenInclude(x => x.Role)
                            .SingleAsync(x => x.Id == id && x.DeletedBy == null);

            var userDetails = await userService.MapUserDetail(mapper, recordFromDb, AppName);

            return Ok(userDetails);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{userId}/application/{appId}")]
    public async Task<IActionResult> DeleteUserRole(Guid userId, Guid appId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                "CALL application.delete_user_role({0}, {1}, {2})",
                userId,
                appId,
                UserEmail
            );

            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpDelete("{userId}/application/by-name")]
    public async Task<IActionResult> DeleteUserRoleByAppName(Guid userId)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var appId = await spaceLinxContext.Apps
                .Where(a => a.AppName == AppName)
                .Select(a => a.Id)
                .FirstOrDefaultAsync();


            await spaceLinxContext.Database.ExecuteSqlRawAsync(
                "CALL application.delete_user_role({0}, {1}, {2})",
                userId,
                appId,
                UserEmail
            );

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
