using Microsoft.AspNetCore.Authorization;

namespace SpaceLinx.Api.Security.Authorization;

/// <summary>Authorization requirement carrying a single SpaceLinx permission key (e.g. "PARTS.MODIFY").</summary>
public sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}
