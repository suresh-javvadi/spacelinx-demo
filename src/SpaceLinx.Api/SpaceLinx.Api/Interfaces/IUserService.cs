using AutoMapper;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IUserService
{
    Task<User?> GetUserDetailsAsync();
    Task<bool> CheckUser(string emailId);
    Task<User> GetUser(string emailId);
    UserDetailReadModel UserDetail(IMapper mapper, User user);
    List<UserDetailReadModel> UserDetails(IMapper mapper, List<User> users);
    List<UserDetailWithUserRoleReadModel> UserDetailsWithUserRole(IMapper mapper, List<User> users);
    Task<UserDetailReadModel> MapUserDetail(IMapper mapper, User user, string appName);
}