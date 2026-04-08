using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

public class UserService(SpaceLinxContext _spaceLinxContext, IHttpContextAccessor _contextAccessor) : BaseService(_spaceLinxContext, _contextAccessor), IUserService
{
    public async Task<User?> GetUserDetailsAsync()
    {
        var user = await _spaceLinxContext.Users
            .AsNoTracking()
            .Include(u => u.UserRoles.Where(ur => ur.Role.Id == UserRoleId))
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RolePermissions)
            .Include(u => u.UserRoles.Where(ur => ur.Role.Id == UserRoleId))
            .ThenInclude(ur => ur.Role)
            .ThenInclude(r => r.RoleFilters)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == UserEmail);

        return user;
    }

    public async Task<bool> CheckUser(string emailId)
    {
        return await _spaceLinxContext.Users.AsNoTracking()
            .AnyAsync(x => x.Email.ToLower() == emailId.ToLower() && x.IsActive == true);
    }

    public async Task<User> GetUser(string emailId)
    {
        return await _spaceLinxContext.Users.AsNoTracking()
                    .SingleAsync(x => x.Email.ToLower() == emailId.ToLower());
    }

    public UserDetailReadModel UserDetail(IMapper mapper, User user)
    {
        UserDetailReadModel userDetail = new UserDetailReadModel();
        var mappedUserDetail = mapper.Map<UserDetailReadModel>(user);
        userDetail = mappedUserDetail;

        foreach (var userRole in user?.UserRoles ?? new List<UserRole>())
        {
            userDetail.Roles.Add(mapper.Map<RoleRefModel>(userRole.Role));
        }

        return userDetail;
    }

    public List<UserDetailReadModel> UserDetails(IMapper mapper, List<User> users)
    {
        List<UserDetailReadModel> usersDetail = new List<UserDetailReadModel>(); 
        foreach (var user in users)
        {
            var userDetail = mapper.Map<UserDetailReadModel>(user); 
            foreach (var userRole in user?.UserRoles ?? new List<UserRole>()) 
            {
                userDetail.Roles.Add(mapper.Map<RoleRefModel>(userRole.Role)); 
            }

            usersDetail.Add(userDetail);
        }

        return usersDetail;
    }

    public List<UserDetailWithUserRoleReadModel> UserDetailsWithUserRole(IMapper mapper, List<User> users)
    {
        List<UserDetailWithUserRoleReadModel> usersDetail = new List<UserDetailWithUserRoleReadModel>();
        foreach (var user in users)
        {
            var userDetail = mapper.Map<UserDetailWithUserRoleReadModel>(user);
            foreach (var userRole in user?.UserRoles ?? new List<UserRole>())
            {
                var roleModel = mapper.Map<RoleRefWithDefaultModel>(userRole.Role);
                roleModel.IsDefault = userRole.IsDefault;
                userDetail.Roles.Add(roleModel);
            }

            usersDetail.Add(userDetail);
        }

        return usersDetail;
    }

    public async Task<UserDetailReadModel> MapUserDetail(IMapper mapper, User user, string appName)
    {
        var app = await _spaceLinxContext.Apps
             .AsNoTracking()
             .Where(x => x.AppName == appName)
             .FirstOrDefaultAsync();

        var userDetail = mapper.Map<UserDetailReadModel>(user);

        foreach (var userRole in user?.UserRoles ?? new List<UserRole>())
        {
            if (userRole.Role.AppId == app.Id)
            {
                var roleRefModel = mapper.Map<RoleRefModel>(userRole.Role);
                userDetail.Roles.Add(roleRefModel);
            }
        }
            return userDetail;
    }
}

 
