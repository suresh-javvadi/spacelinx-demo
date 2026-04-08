namespace SpaceLinx.Api.Configuration;

/// <summary>
/// Configuration options for DigiKey API v4 integration
/// </summary>
public class DigiKeyOptions
{
    public const string SectionName = "DigiKey";

    /// <summary>
    /// Enable or disable DigiKey API integration
    /// </summary>
    public bool Enabled { get; set; } = false;

    /// <summary>
    /// DigiKey API Base URL (production: https://api.digikey.com)
    /// </summary>
    public string BaseUrl { get; set; } = "https://api.digikey.com";

    /// <summary>
    /// DigiKey OAuth2 Token URL
    /// </summary>
    public string TokenUrl { get; set; } = "https://api.digikey.com/v1/oauth2/token";

    /// <summary>
    /// DigiKey API Client ID (from DigiKey Developer Portal)
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// DigiKey API Client Secret (from DigiKey Developer Portal)
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Locale site code (country code: US, CA, UK, DE, etc.)
    /// </summary>
    public string LocaleSite { get; set; } = "US";

    /// <summary>
    /// Locale language (en, de, fr, ja, etc.)
    /// </summary>
    public string LocaleLanguage { get; set; } = "en";

    /// <summary>
    /// Locale currency (USD, EUR, GBP, etc.)
    /// </summary>
    public string LocaleCurrency { get; set; } = "USD";

    /// <summary>
    /// HTTP request timeout in seconds
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;
}
