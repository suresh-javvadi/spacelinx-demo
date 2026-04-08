namespace SpaceLinx.Api.Interfaces;

public interface ICacheService
{
    /// <summary>
    /// Clears all cache entries from the Redis cache
    /// </summary>
    /// <returns>True if successful, false otherwise</returns>
    Task<bool> ClearAllCacheAsync();
}
