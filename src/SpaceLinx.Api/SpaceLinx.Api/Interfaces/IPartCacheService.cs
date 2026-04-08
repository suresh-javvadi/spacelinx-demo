using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IPartCacheService
{
    /// <summary>
    /// Gets unique parts with latest version from cache or database
    /// </summary>
    /// <returns>List of unique parts with their latest versions</returns>
    System.Threading.Tasks.Task<List<PartReadModel>> GetUniquePartsWithLatestVersionAsync();

    /// <summary>
    /// Invalidates the unique parts cache
    /// </summary>
    System.Threading.Tasks.Task InvalidateUniquePartsCacheAsync();
}
