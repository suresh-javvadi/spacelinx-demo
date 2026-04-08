using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace SpaceLinx.Api.Configuration;

public static class ConfigureSwagger
{
    public static void SwaggerUISetup(this IServiceCollection services, string environment, SwaggerGenOptions setup)
    {
        setup.SwaggerDoc("v1", new OpenApiInfo
        {
            Version = "2.0",
            Title = $"SpaceLinx - API [{environment}]"
        });

        setup.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "AzureAd" },
                        Scheme = "oauth2",
                        Name = "AzureAd",
                        In = ParameterLocation.Header
                    },
                    new List<string>()
                }
            });

        setup.AddSecurityDefinition("AzureAd", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.OAuth2,
            Flows = new OpenApiOAuthFlows()
            {
                Implicit = new OpenApiOAuthFlow
                {
                    AuthorizationUrl = new Uri("https://login.microsoftonline.com/common/oauth2/authorize"),
                    TokenUrl = new Uri("https://login.microsoftonline.com/common/common/v2.0/token"),
                    Scopes = new Dictionary<string, string>
                            {
                                { "user_impersonation", "user_impersonation" }
                            }
                }
            }
        });

        setup.CustomSchemaIds(type => type?.FullName?.Replace("+", "_"));
    }
}
