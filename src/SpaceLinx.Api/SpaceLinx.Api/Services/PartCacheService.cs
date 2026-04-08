using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using System.Text.Json;

namespace SpaceLinx.Api.Services;

public class PartCacheService(
    SpaceLinxContext spaceLinxContext,
    IMapper mapper,
    IDistributedCache cache,
    ILogger<PartCacheService> logger,
    IConfiguration configuration) : IPartCacheService
{
    private const string UniquePartsCacheKey = "parts:unique-parts";
    private readonly TimeSpan CacheExpiration = TimeSpan.FromHours(
        int.TryParse(configuration["Redis:PartCacheExpirationHours"], out var hours) ? hours : 24);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };

    public async System.Threading.Tasks.Task<List<PartReadModel>> GetUniquePartsWithLatestVersionAsync()
    {
        // Try to get from cache first
        var cachedData = await cache.GetStringAsync(UniquePartsCacheKey);

        if (!string.IsNullOrEmpty(cachedData))
        {
            try
            {
                var cachedParts = JsonSerializer.Deserialize<List<PartReadModel>>(cachedData, JsonOptions);
                if (cachedParts != null)
                {
                    logger.LogDebug("Returning {Count} unique parts from cache", cachedParts.Count);
                    return cachedParts;
                }
            }
            catch (JsonException ex)
            {
                logger.LogWarning(ex, "Failed to deserialize cached unique parts, fetching from database");
                await cache.RemoveAsync(UniquePartsCacheKey);
            }
        }

        // Fetch from database
        var sql = @"
            SELECT p.*
                FROM (
                    SELECT p.*,
                            ROW_NUMBER() OVER (PARTITION BY p.part_number_suffix ORDER BY p.version DESC) AS rn
                    FROM mes.part p
                    WHERE p.item_type IS NULL AND p.deleted_by IS NULL
                ) p
            WHERE p.rn = 1
        ";

        var latestParts = await spaceLinxContext.Parts
            .FromSqlRaw(sql)
            .Include(x => x.PartType)
            .ThenInclude(xt => xt.PartLevel)
            .Include(x => x.UnitOfMeasure)
            .Include(x => x.CountryOfOrigin)
            .Include(x => x.Subsystem)
            .AsNoTracking()
            .ToListAsync();

        var result = mapper.Map<List<PartReadModel>>(latestParts);

        // Store in cache
        if (result.Any())
        {
            var serializedData = JsonSerializer.Serialize(result, JsonOptions);
            await cache.SetStringAsync(UniquePartsCacheKey, serializedData, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = CacheExpiration
            });
            logger.LogDebug("Cached {Count} unique parts with expiration of {Hours} hours",
                result.Count, CacheExpiration.TotalHours);
        }

        return result;
    }

    public async System.Threading.Tasks.Task InvalidateUniquePartsCacheAsync()
    {
        try
        {
            await cache.RemoveAsync(UniquePartsCacheKey);
            logger.LogInformation("Invalidated unique parts cache");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error invalidating unique parts cache");
        }
    }
}
