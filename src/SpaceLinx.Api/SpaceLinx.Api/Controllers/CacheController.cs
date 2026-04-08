using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;

namespace SpaceLinx.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[SpaceLinxAuthroize]
public class CacheController : ControllerBase
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<CacheController> _logger;

    public CacheController(ICacheService cacheService, ILogger<CacheController> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    /// <summary>
    /// Clears all entries from the Redis cache
    /// </summary>
    /// <returns>Success message if cache was cleared, error message otherwise</returns>
    [HttpDelete("clear")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ClearAllCache()
    {
        _logger.LogInformation("Cache clear request received");

        var success = await _cacheService.ClearAllCacheAsync();

        if (success)
        {
            _logger.LogInformation("Cache cleared successfully");
            return Ok(new { message = "All cache entries have been cleared successfully" });
        }

        _logger.LogError("Failed to clear cache");
        return StatusCode(StatusCodes.Status500InternalServerError,
            new { message = "Failed to clear cache. Redis may not be configured or connection is unavailable." });
    }
}
