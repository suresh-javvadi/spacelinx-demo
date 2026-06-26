using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace SpaceLinx.Api.Configuration;

/// <summary>
/// DEMO ONLY. When "DemoMode:Enabled" is true this scheme replaces Azure AD and
/// authenticates every request as a single fixed user ("DemoMode:Email"), so the app
/// can be shown without any login. The email must match a seeded Super Admin user
/// (see database/seed/20_bootstrap_admin.sql). Never enable this in a real environment.
/// </summary>
public class DemoAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Demo";

    private readonly string _demoEmail;

    public DemoAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IConfiguration configuration)
        : base(options, logger, encoder)
    {
        _demoEmail = configuration["DemoMode:Email"] ?? "demo@spacelinx.dev";
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, _demoEmail),
            new Claim("preferred_username", _demoEmail),
            new Claim("email", _demoEmail),
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
