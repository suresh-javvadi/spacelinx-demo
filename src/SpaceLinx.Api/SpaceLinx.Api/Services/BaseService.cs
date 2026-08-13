using SpaceLinx.Model;
namespace SpaceLinx.Api.Services;

public class BaseService(SpaceLinxContext _spaceLinxContext, IHttpContextAccessor _httpContextAccessor) : IDisposable
{
    public string UserEmail
        => GetUserEmail()
        ?? string.Empty;

    public Guid UserRoleId 
        => GetEffectiveUserRoleId() ?? Guid.Empty;

    public Guid? GetEffectiveUserRoleId()
    {
        var roleIdHeader = _httpContextAccessor.HttpContext?.Request?.Headers["RoleId"].FirstOrDefault();
        if (Guid.TryParse(roleIdHeader, out Guid headerRoleId))
        {
            return headerRoleId;
        }

        var userRoles = _spaceLinxContext.UserRoles
                 .Where(x => x.User.Email.ToLower() == UserEmail
                          && x.DeletedBy == null
                          && x.Role.DeletedBy == null)
                 .ToList();

        var defaultRole = userRoles.FirstOrDefault(x => x.IsDefault);
        if (defaultRole != null)
        {
            return defaultRole.RoleId;
        }

        return userRoles.FirstOrDefault()?.RoleId;
    }


    private string? GetUserEmail()
    {
        string? emailId = _httpContextAccessor.HttpContext?.User?.Identity?.Name;
        emailId ??= _httpContextAccessor.HttpContext?.User?.Claims?.
            FirstOrDefault(x => x.Type == "preferred_username")?.Value;
        emailId = emailId?.ToLower();
        return emailId;
    }

    public void Dispose(bool disposing)
    {
        if (disposing)
        {
            _spaceLinxContext?.Dispose();
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
