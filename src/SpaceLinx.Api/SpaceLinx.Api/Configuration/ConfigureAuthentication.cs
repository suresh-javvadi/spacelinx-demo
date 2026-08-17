using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SpaceLinx.Api.Security.LocalAuth;
using SpaceLinx.Model;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Mail;
using System.Security.Authentication;
using System.Security.Claims;
using System.Text;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Configuration;

public static class ConfigureAuthentication
{
    /// <summary>Azure AD bearer tokens (MSAL sign-in).</summary>
    public const string AzureAdScheme = "AzureAd";

    /// <summary>SpaceLinx-issued bearer tokens (email + password sign-in).</summary>
    public const string LocalScheme = "Local";

    /// <summary>Front door: inspects each token and forwards it to the right scheme.</summary>
    public const string SelectorScheme = "SpaceLinx";

    /// <summary>
    /// Registers authentication for whichever sign-in methods this deployment enables.
    ///
    /// Defaults (no <c>Auth</c> section in configuration) are Microsoft-only, which is
    /// byte-for-byte the previous behaviour. Password sign-in is opt-in per deployment.
    /// </summary>
    public static IServiceCollection AddSpaceLinxAuthentication(this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Configure<AuthOptions>(configuration.GetSection(AuthOptions.SectionName));

        var authOptions = configuration.GetSection(AuthOptions.SectionName).Get<AuthOptions>() ?? new AuthOptions();

        if (!authOptions.Microsoft.Enabled && !authOptions.Password.Enabled)
        {
            throw new InvalidOperationException(
                "No sign-in method is enabled. Set Auth:Microsoft:Enabled and/or Auth:Password:Enabled to true.");
        }

        if (authOptions.Password.Enabled)
        {
            // Fail fast rather than issuing tokens signed with a weak or empty key.
            if (Encoding.UTF8.GetByteCount(authOptions.Password.SigningKey) < 32)
            {
                throw new InvalidOperationException(
                    "Auth:Password:SigningKey must be at least 32 bytes when password sign-in is enabled.");
            }

            services.AddScoped<ILocalTokenService, LocalTokenService>();
            services.AddScoped<ILocalAuthService, LocalAuthService>();
        }

        var builder = services.AddAuthentication(options =>
        {
            options.DefaultScheme = SelectorScheme;
            options.DefaultAuthenticateScheme = SelectorScheme;
            options.DefaultChallengeScheme = SelectorScheme;
        });

        builder.AddPolicyScheme(SelectorScheme, SelectorScheme, options =>
        {
            options.ForwardDefaultSelector = context =>
                SelectScheme(context, authOptions);
        });

        if (authOptions.Microsoft.Enabled)
        {
            builder.AddJwtBearer(AzureAdScheme, options => ConfigureAzureAd(options, configuration));
        }

        if (authOptions.Password.Enabled)
        {
            builder.AddJwtBearer(LocalScheme, options => ConfigureLocal(options, authOptions.Password));
        }

        return services;
    }

    /// <summary>
    /// Routes a request to the scheme that can actually validate its token, by reading the
    /// issuer without validating anything. An unreadable or absent token falls through to
    /// whichever scheme is enabled, which then rejects it normally.
    /// </summary>
    private static string SelectScheme(HttpContext context, AuthOptions authOptions)
    {
        var fallback = authOptions.Microsoft.Enabled ? AzureAdScheme : LocalScheme;

        if (!authOptions.Password.Enabled)
        {
            return AzureAdScheme;
        }

        if (!authOptions.Microsoft.Enabled)
        {
            return LocalScheme;
        }

        var header = context.Request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrEmpty(header) || !header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return fallback;
        }

        var rawToken = header["Bearer ".Length..].Trim();

        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(rawToken))
            {
                return fallback;
            }

            var issuer = handler.ReadJwtToken(rawToken).Issuer;

            return string.Equals(issuer, authOptions.Password.Issuer, StringComparison.Ordinal)
                ? LocalScheme
                : AzureAdScheme;
        }
        catch (Exception)
        {
            // Malformed token — let the fallback scheme produce the 401.
            return fallback;
        }
    }

    private static void ConfigureAzureAd(JwtBearerOptions options, IConfiguration configuration)
    {
        options.Authority = configuration["AzureAd:Authority"];
        options.Audience = configuration["AzureAd:ClientId"];
        options.IncludeErrorDetails = true;
        options.SaveToken = true;

        var tenantId = configuration["AzureAd:TenantId"];

        // Issuer validation is only meaningful when the deployment is pinned to one
        // tenant. Multi-tenant setups (Authority ending in /common) legitimately accept
        // tokens from many issuers, so validation stays off there — matching the
        // behaviour this deployment already relied on.
        var isSingleTenant = Guid.TryParse(tenantId, out _);

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidAudience = options.Audience,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuer = isSingleTenant,
            ValidIssuers = isSingleTenant
                ? new[]
                {
                    $"https://login.microsoftonline.com/{tenantId}/v2.0",
                    $"https://sts.windows.net/{tenantId}/"
                }
                : null
        };

        options.Events = new JwtBearerEvents();
    }

    private static void ConfigureLocal(JwtBearerOptions options, PasswordAuthOptions passwordOptions)
    {
        // Keep claims exactly as issued — "preferred_username" must survive intact,
        // because that is what BaseController and [SpaceLinxAuthroize] read.
        options.MapInboundClaims = false;
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = passwordOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = passwordOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(passwordOptions.SigningKey)),
            ClockSkew = TimeSpan.FromMinutes(1),

            // Makes User.Identity.Name resolve to the email, matching Azure AD tokens.
            NameClaimType = LocalTokenService.EmailClaimType
        };
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
