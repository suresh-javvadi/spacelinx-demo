using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Api.Models.DigiKey;

/// <summary>
/// Request model for DigiKey keyword search
/// </summary>
public class DigiKeySearchRequest
{
    /// <summary>
    /// Search keyword (part number, description, or manufacturer part number)
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 2)]
    public string Keyword { get; set; } = string.Empty;

    /// <summary>
    /// Number of results to return (default: 10, max: 50)
    /// </summary>
    [Range(1, 50)]
    public int Limit { get; set; } = 10;

    /// <summary>
    /// Offset for pagination (default: 0)
    /// </summary>
    [Range(0, int.MaxValue)]
    public int Offset { get; set; } = 0;

    /// <summary>
    /// Filter to only in-stock items
    /// </summary>
    public bool InStockOnly { get; set; } = false;

    /// <summary>
    /// Optional manufacturer name filter
    /// </summary>
    public string? ManufacturerFilter { get; set; }
}
