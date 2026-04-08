using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Models.DigiKey;
using SpaceLinx.Api.Security;

namespace SpaceLinx.Api.Controllers;

/// <summary>
/// Controller for DigiKey product search and information
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[SpaceLinxAuthroize]
public class DigiKeyController : ControllerBase
{
    private readonly IDigiKeyService _digiKeyService;
    private readonly ILogger<DigiKeyController> _logger;

    public DigiKeyController(
        IDigiKeyService digiKeyService,
        ILogger<DigiKeyController> logger)
    {
        _digiKeyService = digiKeyService;
        _logger = logger;
    }

    /// <summary>
    /// Check if DigiKey integration is enabled and connected
    /// </summary>
    /// <returns>Status of DigiKey integration</returns>
    [HttpGet("status")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus()
    {
        var isEnabled = _digiKeyService.IsEnabled;
        var isConnected = isEnabled && await _digiKeyService.IsConnectedAsync();

        return Ok(new
        {
            Enabled = isEnabled,
            Connected = isConnected
        });
    }

    /// <summary>
    /// Search for parts by keyword (part number, description, manufacturer part number)
    /// </summary>
    /// <param name="request">Search parameters including keyword, limit, and filters</param>
    /// <returns>List of matching products with basic information</returns>
    [HttpPost("search")]
    [ProducesResponseType(typeof(DigiKeySearchResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> SearchByKeyword([FromBody] DigiKeySearchRequest request)
    {
        if (!_digiKeyService.IsEnabled)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "DigiKey integration is not enabled" });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        _logger.LogInformation("DigiKey search requested for keyword: {Keyword}", request.Keyword);

        var result = await _digiKeyService.SearchByKeywordAsync(request);

        if (!result.Success)
        {
            _logger.LogWarning("DigiKey search failed: {Error}", result.ErrorMessage);
        }

        return Ok(result);
    }

    /// <summary>
    /// Get complete product details by DigiKey or manufacturer part number
    /// </summary>
    /// <param name="productNumber">DigiKey part number or manufacturer part number</param>
    /// <returns>Full product details including pricing tiers, specifications, and variations</returns>
    [HttpGet("product/{productNumber}")]
    [ProducesResponseType(typeof(DigiKeyProductDetails), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> GetProductDetails(string productNumber)
    {
        if (!_digiKeyService.IsEnabled)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "DigiKey integration is not enabled" });
        }

        if (string.IsNullOrWhiteSpace(productNumber))
        {
            return BadRequest(new { message = "Product number is required" });
        }

        _logger.LogInformation("DigiKey product details requested for: {ProductNumber}", productNumber);

        try
        {
            var result = await _digiKeyService.GetProductDetailsAsync(productNumber);

            if (result == null)
            {
                return NotFound(new { message = $"Product not found: {productNumber}" });
            }

            return Ok(result);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "DigiKey product details request failed for: {ProductNumber}", productNumber);
            return StatusCode(StatusCodes.Status502BadGateway,
                new { message = $"DigiKey API error: {ex.Message}" });
        }
    }
}
