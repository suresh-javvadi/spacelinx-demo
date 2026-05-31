namespace SpaceLinx.Api.Security.Authorization;

/// <summary>The effective authorization context for the current request's user + active role.</summary>
public sealed record UserPermissionSet(string? RoleName, bool IsSuperAdmin, HashSet<string> Permissions)
{
    public bool Has(string permission) => IsSuperAdmin || Permissions.Contains(permission);

    public static UserPermissionSet Empty { get; } = new(null, false, new(StringComparer.OrdinalIgnoreCase));
}

/// <summary>
/// Resolves the current user's effective permissions for their active role (Redis-cached).
/// </summary>
public interface IPermissionResolver
{
    Task<UserPermissionSet> GetCurrentAsync(CancellationToken cancellationToken = default);

    /// <summary>Invalidate all cached permission sets for a user (call when their roles/grants change).</summary>
    Task InvalidateAsync(string email, CancellationToken cancellationToken = default);
}
