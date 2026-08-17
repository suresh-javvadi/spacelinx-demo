using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Model;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SpaceLinx.Api.Security.LocalAuth;

public interface ILocalTokenService
{
    /// <summary>Mints a SpaceLinx-signed bearer token for an authenticated user.</summary>
    (string Token, DateTime ExpiresAtUtc) CreateToken(User user);
}

/// <summary>
/// Issues SpaceLinx's own bearer tokens for password sign-in.
///
/// The token deliberately mirrors the shape of an Azure AD token: the user's email is
/// carried in <c>preferred_username</c>, which is exactly what
/// <see cref="Controllers.BaseController"/>, <see cref="SpaceLinxAuthroizeAttribute"/>
/// and the audit interceptor already read. That is why password sign-in needs no
/// changes anywhere else in the API.
/// </summary>
public class LocalTokenService(IOptions<AuthOptions> authOptions) : ILocalTokenService
{
    private readonly PasswordAuthOptions _options = authOptions.Value.Password;

    /// <summary>The claim every downstream consumer resolves the user's email from.</summary>
    public const string EmailClaimType = "preferred_username";

    public (string Token, DateTime ExpiresAtUtc) CreateToken(User user)
    {
        ArgumentNullException.ThrowIfNull(user);

        var issuedAt = DateTime.UtcNow;
        var expiresAt = issuedAt.AddMinutes(_options.TokenLifetimeMinutes);

        var claims = new List<Claim>
        {
            // Email drives every downstream lookup — keep this claim type in sync
            // with SpaceLinxConstants.PrefUserName.
            new(EmailClaimType, user.Email),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.Sub, user.Id?.ToString() ?? string.Empty),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("display_name", $"{user.FirstName} {user.LastName}".Trim())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: issuedAt,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
