using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Security.LocalAuth;

/// <summary>
/// DEMO ONLY. When <c>Auth:Demo:Enabled</c> is true this scheme authenticates every
/// request as one fixed user (<c>Auth:Demo:Email</c>), so the app can be shown without
/// any sign-in at all.
///
/// The email must match a seeded Super Admin (see database/seed/20_bootstrap_admin.sql).
/// Like the other two schemes it presents the address as "preferred_username", so the
/// rest of the API treats the demo user exactly like any other.
///
/// This grants full access to anyone who can reach the URL. Never enable it on a
/// deployment holding real data.
/// </summary>
public class DemoAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Demo";

    private readonly string _demoEmail;

    public DemoAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        IOptions<AuthOptions> authOptions)
        : base(options, logger, encoder)
    {
        _demoEmail = authOptions.Value.Demo.Email;
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, _demoEmail),
            new Claim(LocalTokenService.EmailClaimType, _demoEmail),
            new Claim("email", _demoEmail),
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);

        return Task.FromResult(
            AuthenticateResult.Success(new AuthenticationTicket(principal, SchemeName)));
    }
}
