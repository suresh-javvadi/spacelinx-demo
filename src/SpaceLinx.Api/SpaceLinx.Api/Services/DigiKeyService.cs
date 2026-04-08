using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using SpaceLinx.Api.Configuration;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Models.DigiKey;
using SpaceLinx.Api.Models.DigiKey.Internal;

namespace SpaceLinx.Api.Services;

/// <summary>
/// Service for DigiKey API v4 integration with OAuth2 authentication
/// </summary>
public class DigiKeyService : IDigiKeyService
{
    private readonly HttpClient _httpClient;
    private readonly DigiKeyOptions _options;
    private readonly ILogger<DigiKeyService> _logger;

    // Token cache (in-memory, thread-safe)
    private string? _cachedToken;
    private DateTime _tokenExpiry = DateTime.MinValue;
    private readonly SemaphoreSlim _tokenLock = new(1, 1);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public DigiKeyService(
        HttpClient httpClient,
        IOptions<DigiKeyOptions> options,
        ILogger<DigiKeyService> logger)
    {
        _options = options.Value;
        _logger = logger;
        _httpClient = httpClient;

        if (_options.Enabled)
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl);
            _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
            _httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
        }
    }

    public bool IsEnabled => _options.Enabled;

    public async Task<bool> IsConnectedAsync()
    {
        if (!IsEnabled) return false;

        try
        {
            var token = await GetAccessTokenAsync();
            return !string.IsNullOrEmpty(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DigiKey connectivity check failed");
            return false;
        }
    }

    public async Task<DigiKeySearchResponse> SearchByKeywordAsync(DigiKeySearchRequest request)
    {
        if (!IsEnabled)
        {
            return new DigiKeySearchResponse
            {
                Success = false,
                ErrorMessage = "DigiKey integration is not enabled"
            };
        }

        try
        {
            var token = await GetAccessTokenAsync();

            var apiRequest = new DigiKeyApiSearchRequest
            {
                Keywords = request.Keyword,
                RecordCount = request.Limit,
                RecordStartPosition = request.Offset,
                Filters = request.InStockOnly
                    ? new DigiKeyApiSearchFilters { MinimumQuantityAvailable = 1 }
                    : null
            };

            using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "/products/v4/search/keyword");
            SetAuthHeaders(httpRequest, token);
            httpRequest.Content = new StringContent(
                JsonSerializer.Serialize(apiRequest, JsonOptions),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(httpRequest);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("DigiKey search failed: {StatusCode} - {Content}",
                    response.StatusCode, content);
                return new DigiKeySearchResponse
                {
                    Success = false,
                    ErrorMessage = $"DigiKey API error: {response.StatusCode}"
                };
            }

            var apiResponse = JsonSerializer.Deserialize<DigiKeyApiSearchResponse>(content, JsonOptions);

            return new DigiKeySearchResponse
            {
                Success = true,
                TotalCount = apiResponse?.ProductsCount ?? 0,
                ReturnedCount = apiResponse?.Products?.Count ?? 0,
                Products = MapToProductSummaries(apiResponse?.Products)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DigiKey keyword search failed for: {Keyword}", request.Keyword);
            return new DigiKeySearchResponse
            {
                Success = false,
                ErrorMessage = $"Search failed: {ex.Message}"
            };
        }
    }

    public async Task<DigiKeyProductDetails?> GetProductDetailsAsync(string productNumber)
    {
        if (!IsEnabled)
        {
            throw new InvalidOperationException("DigiKey integration is not enabled");
        }

        if (string.IsNullOrWhiteSpace(productNumber))
        {
            throw new ArgumentException("Product number is required", nameof(productNumber));
        }

        try
        {
            var token = await GetAccessTokenAsync();
            var encodedPartNumber = Uri.EscapeDataString(productNumber);

            using var httpRequest = new HttpRequestMessage(
                HttpMethod.Get,
                $"/products/v4/search/{encodedPartNumber}/productdetails");
            SetAuthHeaders(httpRequest, token);

            var response = await _httpClient.SendAsync(httpRequest);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("DigiKey product details failed: {StatusCode} - {Content}",
                    response.StatusCode, content);

                if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    return null;
                }

                throw new HttpRequestException(
                    $"DigiKey API error: {response.StatusCode}");
            }

            var apiProduct = JsonSerializer.Deserialize<DigiKeyApiProduct>(content, JsonOptions);
            return MapToProductDetails(apiProduct);
        }
        catch (Exception ex) when (ex is not HttpRequestException and not InvalidOperationException)
        {
            _logger.LogError(ex, "DigiKey product details failed for: {ProductNumber}", productNumber);
            throw new HttpRequestException($"Failed to get product details: {ex.Message}", ex);
        }
    }

    #region Private Methods

    private async Task<string> GetAccessTokenAsync()
    {
        await _tokenLock.WaitAsync();
        try
        {
            // Return cached token if still valid (with 5-minute buffer)
            if (!string.IsNullOrEmpty(_cachedToken) &&
                DateTime.UtcNow < _tokenExpiry.AddMinutes(-5))
            {
                return _cachedToken;
            }

            // Request new token using Client Credentials flow
            using var tokenClient = new HttpClient();
            using var tokenRequest = new HttpRequestMessage(HttpMethod.Post, _options.TokenUrl);
            tokenRequest.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = _options.ClientId,
                ["client_secret"] = _options.ClientSecret
            });

            var response = await tokenClient.SendAsync(tokenRequest);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("DigiKey OAuth token request failed: {StatusCode} - {Content}",
                    response.StatusCode, content);
                throw new HttpRequestException($"OAuth token request failed: {response.StatusCode}");
            }

            var tokenResponse = JsonSerializer.Deserialize<DigiKeyTokenResponse>(content, JsonOptions);

            if (string.IsNullOrEmpty(tokenResponse?.access_token))
            {
                throw new InvalidOperationException("Invalid token response from DigiKey");
            }

            _cachedToken = tokenResponse.access_token;
            _tokenExpiry = DateTime.UtcNow.AddSeconds(tokenResponse.expires_in);

            _logger.LogDebug("DigiKey OAuth token acquired, expires in {Seconds}s",
                tokenResponse.expires_in);

            return _cachedToken;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private void SetAuthHeaders(HttpRequestMessage request, string token)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Add("X-DIGIKEY-Client-Id", _options.ClientId);
        request.Headers.Add("X-DIGIKEY-Locale-Site", _options.LocaleSite);
        request.Headers.Add("X-DIGIKEY-Locale-Language", _options.LocaleLanguage);
        request.Headers.Add("X-DIGIKEY-Locale-Currency", _options.LocaleCurrency);
    }

    private static List<DigiKeyProductSummary> MapToProductSummaries(List<DigiKeyApiProduct>? apiProducts)
    {
        if (apiProducts == null || apiProducts.Count == 0)
            return new List<DigiKeyProductSummary>();

        return apiProducts.Select(p => new DigiKeyProductSummary
        {
            DigiKeyPartNumber = p.DigiKeyPartNumber ?? string.Empty,
            ManufacturerProductNumber = p.ManufacturerProductNumber ?? string.Empty,
            ManufacturerName = p.Manufacturer?.Name ?? string.Empty,
            ProductDescription = p.Description?.ProductDescription ?? string.Empty,
            DetailedDescription = p.Description?.DetailedDescription,
            UnitPrice = p.UnitPrice,
            QuantityAvailable = p.QuantityAvailable ?? 0,
            DatasheetUrl = p.DatasheetUrl,
            ProductUrl = p.ProductUrl,
            PhotoUrl = p.PrimaryPhoto
        }).ToList();
    }

    private static DigiKeyProductDetails? MapToProductDetails(DigiKeyApiProduct? apiProduct)
    {
        if (apiProduct == null)
            return null;

        return new DigiKeyProductDetails
        {
            DigiKeyPartNumber = apiProduct.DigiKeyPartNumber ?? string.Empty,
            ManufacturerProductNumber = apiProduct.ManufacturerProductNumber ?? string.Empty,
            ManufacturerName = apiProduct.Manufacturer?.Name ?? string.Empty,
            ProductDescription = apiProduct.Description?.ProductDescription ?? string.Empty,
            DetailedDescription = apiProduct.Description?.DetailedDescription,
            UnitPrice = apiProduct.UnitPrice,
            QuantityAvailable = apiProduct.QuantityAvailable ?? 0,
            DatasheetUrl = apiProduct.DatasheetUrl,
            ProductUrl = apiProduct.ProductUrl,
            PhotoUrl = apiProduct.PrimaryPhoto,
            PackageType = apiProduct.Packaging?.Name,
            Series = apiProduct.Series?.Name,
            ManufacturerLeadWeeks = apiProduct.ManufacturerLeadWeeks,
            DateLastBuyChance = apiProduct.DateLastBuyChance,
            ProductStatus = apiProduct.ProductStatus,
            Category = apiProduct.Category?.Name,
            Family = apiProduct.Category?.ParentName,
            StandardPricing = apiProduct.StandardPricing?.Select(pb => new DigiKeyPriceBreak
            {
                BreakQuantity = pb.BreakQuantity ?? 0,
                UnitPrice = pb.UnitPrice ?? 0,
                TotalPrice = pb.TotalPrice ?? 0
            }).ToList() ?? new List<DigiKeyPriceBreak>(),
            ProductVariations = apiProduct.ProductVariations?.Select(pv => new DigiKeyProductVariation
            {
                DigiKeyPartNumber = pv.DigiKeyProductNumber ?? string.Empty,
                PackageType = pv.PackageType?.Name ?? string.Empty,
                QuantityAvailable = pv.QuantityAvailable ?? 0
            }).ToList() ?? new List<DigiKeyProductVariation>(),
            Parameters = apiProduct.Parameters?.Select(param => new DigiKeyParameter
            {
                ParameterName = param.ParameterText ?? string.Empty,
                Value = param.ValueText ?? string.Empty
            }).ToList() ?? new List<DigiKeyParameter>()
        };
    }

    #endregion
}
