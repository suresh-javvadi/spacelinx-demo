namespace SpaceLinx.Api.Models.DigiKey;

/// <summary>
/// Summary product information returned from keyword search
/// </summary>
public class DigiKeyProductSummary
{
    /// <summary>
    /// DigiKey's unique part number
    /// </summary>
    public string DigiKeyPartNumber { get; set; } = string.Empty;

    /// <summary>
    /// Manufacturer's part number
    /// </summary>
    public string ManufacturerProductNumber { get; set; } = string.Empty;

    /// <summary>
    /// Manufacturer name
    /// </summary>
    public string ManufacturerName { get; set; } = string.Empty;

    /// <summary>
    /// Short product description
    /// </summary>
    public string ProductDescription { get; set; } = string.Empty;

    /// <summary>
    /// Detailed product description
    /// </summary>
    public string? DetailedDescription { get; set; }

    /// <summary>
    /// Unit price in configured currency
    /// </summary>
    public decimal? UnitPrice { get; set; }

    /// <summary>
    /// Quantity available in stock
    /// </summary>
    public int QuantityAvailable { get; set; }

    /// <summary>
    /// URL to product datasheet
    /// </summary>
    public string? DatasheetUrl { get; set; }

    /// <summary>
    /// URL to product page on DigiKey
    /// </summary>
    public string? ProductUrl { get; set; }

    /// <summary>
    /// URL to product photo
    /// </summary>
    public string? PhotoUrl { get; set; }
}
