using Microsoft.AspNetCore.Authorization;
using SpaceLinx.Api.Security.Authorization;

namespace SpaceLinx.Api.Configuration;

public static class ConfigureAuthorization
{
    /// <summary>
    /// Registers permission-based authorization (T1.3): the per-permission policy provider, the handler,
    /// the Redis-cached resolver, and options. Does NOT yet apply deny-by-default — endpoints opt in via
    /// [RequirePermission]; the deny-by-default fallback + broad rollout is T1.4 (flag: Authorization:EnforcePermissions).
    /// </summary>
    public static IServiceCollection AddSpaceLinxAuthorization(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<SpaceLinxAuthorizationOptions>(
            configuration.GetSection(SpaceLinxAuthorizationOptions.SectionName));

        services.AddScoped<IPermissionResolver, PermissionResolver>();
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
        services.AddAuthorization();

        return services;
    }
}
