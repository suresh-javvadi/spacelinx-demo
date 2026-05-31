using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Options;
using SpaceLinx.Model;
using System.Text.Json;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Security.Authorization;

/// <summary>
/// Resolves the current user's effective permissions for their <b>active</b> role.
/// Security notes vs. the legacy behavior:
///  - The "RoleId" header is honored ONLY if the user actually holds that role (verified against user_role),
///    closing the unverified role-switch hole in the old BaseService.GetEffectiveUserRoleId().
///  - "Super Admin" short-circuits to god-mode (UAT shows Super Admin carries ~1 grant by design).
/// Cached in Redis per (email, active role), with O(1) invalidation via a per-user version counter.
/// </summary>
public sealed class PermissionResolver(
    SpaceLinxContext db,
    IDistributedCache cache,
    IHttpContextAccessor http,
    IOptions<SpaceLinxAuthorizationOptions> options) : IPermissionResolver
{
    private readonly SpaceLinxAuthorizationOptions _opts = options.Value;

    public async Task<UserPermissionSet> GetCurrentAsync(CancellationToken cancellationToken = default)
    {
        var httpContext = http.HttpContext;
        if (httpContext is null) return UserPermissionSet.Empty;

        var email = GetEmail(httpContext);
        if (string.IsNullOrEmpty(email)) return UserPermissionSet.Empty;

        var roleId = await ResolveActiveRoleIdAsync(email, httpContext, cancellationToken);
        if (roleId is null) return UserPermissionSet.Empty;

        var version = await GetVersionAsync(email, cancellationToken);
        var cacheKey = $"perm:{email}:{version}:{roleId}";

        var cached = await cache.GetStringAsync(cacheKey, cancellationToken);
        if (cached is not null)
            return JsonSerializer.Deserialize<UserPermissionSet>(cached) ?? UserPermissionSet.Empty;

        var role = await db.Roles.AsNoTracking()
            .Where(r => r.Id == roleId && r.DeletedAt == null)
            .Select(r => new { r.RoleName })
            .FirstOrDefaultAsync(cancellationToken);
        if (role is null) return UserPermissionSet.Empty;

        var isSuperAdmin = string.Equals(role.RoleName?.Trim(), _opts.SuperAdminRoleName,
            StringComparison.OrdinalIgnoreCase);

        var permissions = isSuperAdmin
            ? new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            : (await db.RolePermissions.AsNoTracking()
                .Where(rp => rp.RoleId == roleId && rp.Enable && rp.DeletedAt == null)
                .Select(rp => rp.Permission)
                .ToListAsync(cancellationToken))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var set = new UserPermissionSet(role.RoleName, isSuperAdmin, permissions);

        await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(set),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_opts.CacheMinutes)
            }, cancellationToken);

        return set;
    }

    public async Task InvalidateAsync(string email, CancellationToken cancellationToken = default)
    {
        email = email.ToLowerInvariant();
        var current = await GetVersionAsync(email, cancellationToken);
        await cache.SetStringAsync($"perm-ver:{email}", (current + 1).ToString(), cancellationToken);
    }

    private async Task<long> GetVersionAsync(string email, CancellationToken cancellationToken)
    {
        var raw = await cache.GetStringAsync($"perm-ver:{email}", cancellationToken);
        return long.TryParse(raw, out var v) ? v : 0;
    }

    /// <summary>Active role = verified header role, else default role, else first assigned role.</summary>
    private async Task<Guid?> ResolveActiveRoleIdAsync(string email, HttpContext ctx, CancellationToken cancellationToken)
    {
        var userRoles = await db.UserRoles.AsNoTracking()
            .Where(ur => ur.User.Email.ToLower() == email && ur.DeletedAt == null)
            .Select(ur => new { ur.RoleId, ur.IsDefault })
            .ToListAsync(cancellationToken);

        if (userRoles.Count == 0) return null;

        var header = ctx.Request.Headers["RoleId"].FirstOrDefault();
        if (Guid.TryParse(header, out var headerRoleId) && userRoles.Any(ur => ur.RoleId == headerRoleId))
            return headerRoleId; // verified the user actually holds this role

        return userRoles.FirstOrDefault(ur => ur.IsDefault)?.RoleId ?? userRoles[0].RoleId;
    }

    private static string? GetEmail(HttpContext ctx)
    {
        var email = ctx.User.Identity?.Name
            ?? ctx.User.Claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value;
        return email?.ToLowerInvariant();
    }
}
