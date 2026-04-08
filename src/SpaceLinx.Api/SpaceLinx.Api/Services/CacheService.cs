using Microsoft.Extensions.Caching.Distributed;
using SpaceLinx.Api.Interfaces;
using StackExchange.Redis;

namespace SpaceLinx.Api.Services;

public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly IConnectionMultiplexer? _connectionMultiplexer;
    private readonly ILogger<CacheService> _logger;

    public CacheService(
        IDistributedCache cache,
        ILogger<CacheService> logger,
        IConnectionMultiplexer? connectionMultiplexer = null)
    {
        _cache = cache;
        _logger = logger;
        _connectionMultiplexer = connectionMultiplexer;
    }

    public async Task<bool> ClearAllCacheAsync()
    {
        const int batchSize = 100;

        try
        {
            // If Redis is configured (not using in-memory cache)
            if (_connectionMultiplexer != null && _connectionMultiplexer.IsConnected)
            {
                var endpoints = _connectionMultiplexer.GetEndPoints();
                var db = _connectionMultiplexer.GetDatabase();

                foreach (var endpoint in endpoints)
                {
                    var server = _connectionMultiplexer.GetServer(endpoint);
                    var totalDeleted = 0;

                    // Use SCAN with pageSize to iterate without blocking Redis
                    var keyBatch = new List<RedisKey>(batchSize);
                    foreach (var key in server.Keys(pageSize: batchSize))
                    {
                        keyBatch.Add(key);

                        if (keyBatch.Count >= batchSize)
                        {
                            // Batch delete for better performance
                            await db.KeyDeleteAsync(keyBatch.ToArray());
                            totalDeleted += keyBatch.Count;
                            keyBatch.Clear();
                        }
                    }

                    // Delete remaining keys
                    if (keyBatch.Count > 0)
                    {
                        await db.KeyDeleteAsync(keyBatch.ToArray());
                        totalDeleted += keyBatch.Count;
                    }

                    _logger.LogInformation("Cleared {Count} Redis keys for endpoint: {Endpoint}", totalDeleted, endpoint);
                }

                return true;
            }
            else
            {
                _logger.LogWarning("Redis connection not available. Cannot clear cache. Using in-memory cache or Redis not configured.");
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while clearing Redis cache");
            return false;
        }
    }
}
