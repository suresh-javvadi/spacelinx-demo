using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IBomService
{
    Task<PartDetailReadModel> BuildBomHierarchy(Guid partId, int maxLevel);
    Task<PartDetailReadModel> GetFullBomHierarchyAsync(Guid partId);
    Task<PartDetailReadModel> GetBomHierarchyByLevelAsync(Guid partId, int maxLevel);
    Task<List<PartDetailReadModel>> GetFullParentHierarchyAsync(Guid partId);
    Task<List<PartDetailReadModel>> GetParentHierarchyByLevelAsync(Guid partId, int maxLevel);
    System.Threading.Tasks.Task InvalidateBomCacheAsync(Guid partId);
    Task<List<FlatBomItem>> GetFlatBomAsync(Guid partId);
    Task<List<SubsystemBomHierarchyReadModel>> GetBomHierarchyBySubsystemAsync(Guid partId);
    Task<List<LocationBomHierarchyReadModel>> GetBomHierarchyByLocationAsync(Guid partId);
}
