using SpaceLinx.Api.Models.DigiKey;

namespace SpaceLinx.Api.Interfaces;

/// <summary>
/// Service interface for DigiKey API v4 integration
/// </summary>
public interface IDigiKeyService
{
    /// <summary>
    /// Indicates if DigiKey integration is enabled
    /// </summary>
    bool IsEnabled { get; }

    /// <summary>
    /// Tests connectivity to DigiKey API
    /// </summary>
    /// <returns>True if connection is successful</returns>
    Task<bool> IsConnectedAsync();

    /// <summary>
    /// Searches for products by keyword (part name, description, manufacturer part number)
    /// </summary>
    /// <param name="request">Search request with keyword and optional filters</param>
    /// <returns>Search results with matching products</returns>
    Task<DigiKeySearchResponse> SearchByKeywordAsync(DigiKeySearchRequest request);

    /// <summary>
    /// Gets full product details by DigiKey or manufacturer part number
    /// </summary>
    /// <param name="productNumber">DigiKey part number or manufacturer part number</param>
    /// <returns>Complete product details including pricing, specs, and variations</returns>
    Task<DigiKeyProductDetails?> GetProductDetailsAsync(string productNumber);
}
