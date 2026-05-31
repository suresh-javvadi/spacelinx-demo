using Microsoft.AspNetCore.Authorization;

namespace SpaceLinx.Api.Security.Authorization;

/// <summary>
/// Requires the caller to hold the given SpaceLinx permission. Usage:
/// <c>[RequirePermission(Permissions.Parts.Modify)]</c>.
/// Backed by <see cref="PermissionPolicyProvider"/> which builds a policy per permission on demand.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public sealed class RequirePermissionAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "perm:";

    public RequirePermissionAttribute(string permission) => Policy = PolicyPrefix + permission;

    public string Permission => Policy![PolicyPrefix.Length..];
}
