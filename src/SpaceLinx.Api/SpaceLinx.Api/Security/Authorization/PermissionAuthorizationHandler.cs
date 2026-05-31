using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace SpaceLinx.Api.Security.Authorization;

/// <summary>
/// Grants a <see cref="PermissionRequirement"/> when the current user's active role holds the permission
/// (or is Super Admin). In SHADOW mode (EnforcePermissions=false) a miss is logged but allowed, so we can
/// observe would-be denials before enforcing (T1.4).
/// </summary>
public sealed class PermissionAuthorizationHandler(
    IPermissionResolver resolver,
    IOptions<SpaceLinxAuthorizationOptions> options,
    ILogger<PermissionAuthorizationHandler> logger) : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var set = await resolver.GetCurrentAsync();

        if (set.Has(requirement.Permission))
        {
            context.Succeed(requirement);
            return;
        }

        if (!options.Value.EnforcePermissions)
        {
            logger.LogWarning(
                "AuthZ SHADOW: would DENY {Permission} for role {Role} (allowed — enforcement off)",
                requirement.Permission, set.RoleName ?? "(none)");
            context.Succeed(requirement);
            return;
        }

        logger.LogInformation(
            "AuthZ DENY: {Permission} for role {Role}", requirement.Permission, set.RoleName ?? "(none)");
        context.Fail(new AuthorizationFailureReason(this, $"Missing permission '{requirement.Permission}'."));
    }
}
