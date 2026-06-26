using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Net.Mail;
using System.Security.Authentication;
using System.Security.Claims;

namespace SpaceLinx.Api.Configuration;

public static class ConfigureAuthentication
{
    public static IServiceCollection AddSpaceLinxAuthentication(this IServiceCollection services,
        IConfiguration configuration)
    {
        // DEMO ONLY: when enabled, bypass Azure AD entirely and authenticate every request
        // as the fixed demo user. Keeps [Authorize] / the fallback policy satisfied without a login.
        if (configuration.GetValue<bool>("DemoMode:Enabled"))
        {
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = DemoAuthenticationHandler.SchemeName;
                options.DefaultChallengeScheme = DemoAuthenticationHandler.SchemeName;
            }).AddScheme<AuthenticationSchemeOptions, DemoAuthenticationHandler>(
                DemoAuthenticationHandler.SchemeName, _ => { });

            return services;
        }

        //Add Services
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = "AzureAd";
            options.DefaultSignInScheme = "AzureAd";
            options.DefaultChallengeScheme = "AzureAd";
        }).AddJwtBearer("AzureAd", options =>
        {
            options.Authority = configuration["AzureAd:Authority"];
            options.Audience = configuration["AzureAd:ClientId"];
            options.IncludeErrorDetails = true;
            options.SaveToken = true;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidAudience = options.Audience,
                ValidateIssuer = false,
                ValidateAudience = true,
                ValidateLifetime = true
            };

            options.Events = new JwtBearerEvents()
            {
                //OnTokenValidated = OnJwtTokenValidated
            };
        });

        return services;
    }

    /// <summary>
    /// Called when [JWT token validated].
    /// </summary>
    /// <param name="context">The context.</param>
    /// <returns></returns>
    public static async Task OnJwtTokenValidated(TokenValidatedContext context)
    {
        string? emailId = GetUserEmail(context);

        if (string.IsNullOrEmpty(emailId))
        {
            throw new AuthenticationException("User is not authenticated.");
        }

        if (context.HttpContext.Request.Path.Value.Contains(SpaceLinxConstants.UnAuthenticatedApiPath))
        {
            return;
        }

        List<Claim> claimList = new();

        if (!MailAddress.TryCreate(emailId, out var email))
        {
            throw new AuthenticationException("User is not authenticated.");
        }

        claimList.Add(new Claim("email", emailId));
        context?.Principal?.AddIdentity(new ClaimsIdentity(claimList));
    }

    private static string? GetUserEmail(TokenValidatedContext context)
    {
        string? emailId = context.Principal?.Identity?.Name; //Azure version 1
        emailId ??= context.Principal?.Claims?.FirstOrDefault(x => (x.Type == SpaceLinxConstants.PrefUserName || //Azure version 2
        x.Type == SpaceLinxConstants.EmailClaim))?.Value; //Google 
        emailId = emailId?.ToLower();
        return emailId;
    }
}
