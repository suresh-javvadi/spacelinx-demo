namespace SpaceLinx.Api.Models.DigiKey;

/// <summary>
/// Response model for DigiKey keyword search
/// </summary>
public class DigiKeySearchResponse
{
    /// <summary>
    /// Indicates if the search was successful
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Error message if search failed
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Total number of products matching the search
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Number of products returned in this response
    /// </summary>
    public int ReturnedCount { get; set; }

    /// <summary>
    /// List of matching products
    /// </summary>
    public List<DigiKeyProductSummary> Products { get; set; } = new();
}
