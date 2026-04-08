namespace SpaceLinx.Api.Models.DigiKey;

/// <summary>
/// Complete product details from product details endpoint
/// </summary>
public class DigiKeyProductDetails : DigiKeyProductSummary
{
    /// <summary>
    /// Standard pricing with quantity breaks
    /// </summary>
    public List<DigiKeyPriceBreak> StandardPricing { get; set; } = new();

    /// <summary>
    /// Package type (e.g., Cut Tape, Tape & Reel)
    /// </summary>
    public string? PackageType { get; set; }

    /// <summary>
    /// Product series
    /// </summary>
    public string? Series { get; set; }

    /// <summary>
    /// Manufacturer lead time in weeks
    /// </summary>
    public string? ManufacturerLeadWeeks { get; set; }

    /// <summary>
    /// Last date to buy this product (if being discontinued)
    /// </summary>
    public DateTime? DateLastBuyChance { get; set; }

    /// <summary>
    /// Product variations (different packaging options)
    /// </summary>
    public List<DigiKeyProductVariation> ProductVariations { get; set; } = new();

    /// <summary>
    /// Product lifecycle status
    /// </summary>
    public string? ProductStatus { get; set; }

    /// <summary>
    /// Product category
    /// </summary>
    public string? Category { get; set; }

    /// <summary>
    /// Product family (parent category)
    /// </summary>
    public string? Family { get; set; }

    /// <summary>
    /// Technical parameters/specifications
    /// </summary>
    public List<DigiKeyParameter> Parameters { get; set; } = new();
}

/// <summary>
/// Quantity-based price break
/// </summary>
public class DigiKeyPriceBreak
{
    /// <summary>
    /// Minimum quantity for this price tier
    /// </summary>
    public int BreakQuantity { get; set; }

    /// <summary>
    /// Price per unit at this quantity
    /// </summary>
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Total price for break quantity
    /// </summary>
    public decimal TotalPrice { get; set; }
}

/// <summary>
/// Product variation (different packaging options)
/// </summary>
public class DigiKeyProductVariation
{
    /// <summary>
    /// DigiKey part number for this variation
    /// </summary>
    public string DigiKeyPartNumber { get; set; } = string.Empty;

    /// <summary>
    /// Package type for this variation
    /// </summary>
    public string PackageType { get; set; } = string.Empty;

    /// <summary>
    /// Quantity available for this variation
    /// </summary>
    public int QuantityAvailable { get; set; }
}

/// <summary>
/// Technical parameter/specification
/// </summary>
public class DigiKeyParameter
{
    /// <summary>
    /// Parameter name (e.g., Capacitance, Voltage Rating)
    /// </summary>
    public string ParameterName { get; set; } = string.Empty;

    /// <summary>
    /// Parameter value (e.g., 10uF, 25V)
    /// </summary>
    public string Value { get; set; } = string.Empty;
}
