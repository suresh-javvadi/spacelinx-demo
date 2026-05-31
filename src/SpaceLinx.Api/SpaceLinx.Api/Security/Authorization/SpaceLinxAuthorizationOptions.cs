namespace SpaceLinx.Api.Security.Authorization;

/// <summary>
/// Options controlling permission-based authorization. Bound from the "Authorization" config section.
/// </summary>
public sealed class SpaceLinxAuthorizationOptions
{
    public const string SectionName = "Authorization";

    /// <summary>Role name whose members bypass all permission checks (god-mode).</summary>
    public string SuperAdminRoleName { get; set; } = "Super Admin";

    /// <summary>
    /// When false (default), the handler runs in SHADOW mode: it logs what it *would* deny but allows the
    /// request through. This lets us roll permission enforcement out safely (T1.4) by first observing the
    /// logs for false denials, then flipping this to true to enforce.
    /// </summary>
    public bool EnforcePermissions { get; set; }

    /// <summary>How long a resolved permission set is cached in Redis.</summary>
    public int CacheMinutes { get; set; } = 10;
}
