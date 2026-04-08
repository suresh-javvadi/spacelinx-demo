namespace SpaceLinx.Api.Models.DigiKey.Internal;

/// <summary>
/// Maps to DigiKey API v4 OAuth token response
/// </summary>
internal class DigiKeyTokenResponse
{
    public string access_token { get; set; } = string.Empty;
    public string token_type { get; set; } = string.Empty;
    public int expires_in { get; set; }
}

/// <summary>
/// Maps to DigiKey API v4 keyword search request body
/// </summary>
internal class DigiKeyApiSearchRequest
{
    public string Keywords { get; set; } = string.Empty;
    public int RecordCount { get; set; } = 10;
    public int RecordStartPosition { get; set; } = 0;
    public DigiKeyApiSearchFilters? Filters { get; set; }
    public DigiKeyApiSearchSort? Sort { get; set; }
}

internal class DigiKeyApiSearchFilters
{
    public List<int>? ManufacturerIds { get; set; }
    public int? MinimumQuantityAvailable { get; set; }
}

internal class DigiKeyApiSearchSort
{
    public string SortOption { get; set; } = "SortByDigiKeyPartNumber";
    public string Direction { get; set; } = "Ascending";
}

/// <summary>
/// Maps to DigiKey API v4 search response
/// </summary>
internal class DigiKeyApiSearchResponse
{
    public int ProductsCount { get; set; }
    public List<DigiKeyApiProduct>? Products { get; set; }
}

/// <summary>
/// Maps to DigiKey API v4 product object
/// </summary>
internal class DigiKeyApiProduct
{
    public string? DigiKeyPartNumber { get; set; }
    public DigiKeyApiManufacturer? Manufacturer { get; set; }
    public string? ManufacturerProductNumber { get; set; }
    public DigiKeyApiDescription? Description { get; set; }
    public decimal? UnitPrice { get; set; }
    public int? QuantityAvailable { get; set; }
    public string? DatasheetUrl { get; set; }
    public string? ProductUrl { get; set; }
    public string? PrimaryPhoto { get; set; }
    public string? ProductStatus { get; set; }
    public DigiKeyApiCategory? Category { get; set; }
    public DigiKeyApiSeries? Series { get; set; }
    public string? ManufacturerLeadWeeks { get; set; }
    public DateTime? DateLastBuyChance { get; set; }
    public List<DigiKeyApiPriceBreak>? StandardPricing { get; set; }
    public List<DigiKeyApiProductVariation>? ProductVariations { get; set; }
    public List<DigiKeyApiParameter>? Parameters { get; set; }
    public DigiKeyApiPackaging? Packaging { get; set; }
}

internal class DigiKeyApiManufacturer
{
    public int? Id { get; set; }
    public string? Name { get; set; }
}

internal class DigiKeyApiDescription
{
    public string? ProductDescription { get; set; }
    public string? DetailedDescription { get; set; }
}

internal class DigiKeyApiCategory
{
    public int? CategoryId { get; set; }
    public string? Name { get; set; }
    public string? ParentName { get; set; }
}

internal class DigiKeyApiSeries
{
    public int? Id { get; set; }
    public string? Name { get; set; }
}

internal class DigiKeyApiPackaging
{
    public int? Id { get; set; }
    public string? Name { get; set; }
}

internal class DigiKeyApiPriceBreak
{
    public int? BreakQuantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
}

internal class DigiKeyApiProductVariation
{
    public string? DigiKeyProductNumber { get; set; }
    public DigiKeyApiPackaging? PackageType { get; set; }
    public int? QuantityAvailable { get; set; }
    public List<DigiKeyApiPriceBreak>? StandardPricing { get; set; }
}

internal class DigiKeyApiParameter
{
    public string? ParameterText { get; set; }
    public string? ValueText { get; set; }
}
