using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using System.Text.Json;

namespace SpaceLinx.Api.Services;

public class BomService(SpaceLinxContext _spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor, IDistributedCache _cache, IBackgroundTaskQueue _backgroundTaskQueue, IServiceScopeFactory _serviceScopeFactory, ILogger<BomService> _logger, IConfiguration configuration)
    : BaseService(_spaceLinxContext, _contextAccessor), IBomService
{
    private const string BomCacheKeyPrefix = "bom:hierarchy:";
    private readonly TimeSpan CacheExpiration = TimeSpan.FromHours(int.Parse(configuration["Redis:BomCacheExpirationHours"]));

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        WriteIndented = false
    };

    public async Task<PartDetailReadModel> BuildBomHierarchy(Guid partId, int maxLevel)
    {
        var visitedParts = new HashSet<Guid>();
        var result = await BomAsync(partId, 1, maxLevel, visitedParts);

        return result;
    }

    public async Task<PartDetailReadModel> GetFullBomHierarchyAsync(Guid partId)
    {
        var cacheKey = $"{BomCacheKeyPrefix}{partId}";
        var cachedData = await _cache.GetStringAsync(cacheKey);

        if (!string.IsNullOrEmpty(cachedData))
        {
            try
            {
                var cachedBom = JsonSerializer.Deserialize<PartDetailReadModel>(cachedData, JsonOptions);
                if (cachedBom != null)
                {
                    return cachedBom;
                }
            }
            catch (JsonException)
            {
                await _cache.RemoveAsync(cacheKey);
            }
        }

        var ancestorPath = new HashSet<Guid>();
        var bom = await BuildFullBomHierarchyAsync(partId, ancestorPath, null);

        if (bom != null)
        {
            var serializedBom = JsonSerializer.Serialize(bom, JsonOptions);
            await _cache.SetStringAsync(cacheKey, serializedBom, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = CacheExpiration
            });
        }

        return bom;
    }

    public async System.Threading.Tasks.Task InvalidateBomCacheAsync(Guid partId)
    {
        // Queue the cache invalidation as a background task
        // This allows the API to return immediately without waiting for cache invalidation
        await _backgroundTaskQueue.QueueBackgroundWorkItemAsync(async cancellationToken =>
        {
            try
            {
                _logger.LogInformation("Starting BOM cache invalidation for partId: {PartId}", partId);

                // Create a new scope to get a fresh DbContext since the original request scope will be disposed
                using var scope = _serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<SpaceLinxContext>();

                await InvalidateBomCacheRecursiveAsync(partId, new HashSet<Guid>(), dbContext, cancellationToken);

                _logger.LogInformation("Completed BOM cache invalidation for partId: {PartId}", partId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during BOM cache invalidation for partId: {PartId}", partId);
            }
        });
    }

    private async System.Threading.Tasks.Task InvalidateBomCacheRecursiveAsync(Guid partId, HashSet<Guid> visited, SpaceLinxContext dbContext, CancellationToken cancellationToken = default)
    {
        // Check for cancellation
        if (cancellationToken.IsCancellationRequested)
        {
            _logger.LogDebug("Cache invalidation cancelled for partId: {PartId}", partId);
            return;
        }

        // Prevent infinite loops in case of circular BOM references
        if (!visited.Add(partId))
        {
            _logger.LogDebug("PartId {PartId} already visited, skipping to prevent circular reference", partId);
            return;
        }

        // Invalidate this part's cache
        var cacheKey = $"{BomCacheKeyPrefix}{partId}";
        await _cache.RemoveAsync(cacheKey, cancellationToken);
        _logger.LogDebug("Invalidated cache for partId: {PartId}, cache key: {CacheKey}", partId, cacheKey);

        // Find all parent parts (parts that use this part as a child)
        var parentPartIds = await dbContext.Eboms
            .Where(e => e.ChildPartId == partId && e.DeletedBy == null)
            .Select(e => e.PartId)
            .Distinct()
            .ToListAsync(cancellationToken);

        _logger.LogDebug("Found {Count} parent parts for partId: {PartId}", parentPartIds.Count, partId);

        // Recursively invalidate all parent parts
        foreach (var parentId in parentPartIds)
        {
            await InvalidateBomCacheRecursiveAsync(parentId, visited, dbContext, cancellationToken);
        }
    }

    public async Task<PartDetailReadModel> GetBomHierarchyByLevelAsync(Guid partId, int maxLevel)
    {
        var ancestorPath = new HashSet<Guid>();
        return await BuildBomHierarchyByLevelAsync(partId, ancestorPath, 1, maxLevel);
    }

    private async Task<PartDetailReadModel> BuildFullBomHierarchyAsync(Guid partId, HashSet<Guid> ancestorPath, Guid? ebomId)
    {
        // Check if this part is already in the current path (circular reference)
        if (ancestorPath.Contains(partId))
        {
            // Circular reference detected - return null to skip this child
            return null;
        }

        var part = await _spaceLinxContext.Parts
            .Include(p => p.PartType)
            .ThenInclude(p => p.PartLevel)
            .Include(p => p.CountryOfOrigin)
            .Include(p => p.Subsystem)
            .FirstOrDefaultAsync(p => p.Id == partId && p.DeletedBy == null);

        if (part == null)
            return null;

        var model = mapper.Map<PartDetailReadModel>(part);

        model.EbomId = ebomId;
        // Add current part to the ancestor path
        ancestorPath.Add(partId);

        var childEboms = await _spaceLinxContext.Eboms
            .Where(e => e.PartId == partId && e.DeletedBy == null)
            .Include(e => e.AssemblyLocation)
            .ToListAsync();

        if (childEboms.Any())
        {
            model.Children = new List<PartDetailReadModel>();
            foreach (var ebom in childEboms)
            {
                // Create a copy of the ancestor path for this branch
                var branchPath = new HashSet<Guid>(ancestorPath);
                var child = await BuildFullBomHierarchyAsync(ebom.ChildPartId, branchPath, ebom.Id);
                if (child != null)
                {
                    child.Quantity = ebom.Quantity;
                    child.AssemblyLocationId = ebom.AssemblyLocationId;
                    child.AssemblyLocationName = ebom.AssemblyLocation?.Name;
                    model.Children.Add(child);
                }
            }
        }

        return model;
    }

    private async Task<PartDetailReadModel> BuildBomHierarchyByLevelAsync(Guid partId, HashSet<Guid> ancestorPath, int currentLevel, int maxLevel)
    {
        // Check if this part is already in the current path (circular reference)
        if (ancestorPath.Contains(partId))
        {
            // Circular reference detected - return null to skip this child
            return null;
        }

        var part = await _spaceLinxContext.Parts
            .Include(p => p.PartType)
            .ThenInclude(p => p.PartLevel)
            .Include(p => p.CountryOfOrigin)
            .Include(p => p.Subsystem)
            .FirstOrDefaultAsync(p => p.Id == partId && p.DeletedBy == null);

        if (part == null)
            return null;

        var model = mapper.Map<PartDetailReadModel>(part);

        // Check if we've reached the maximum level
        if (currentLevel >= maxLevel)
        {
            return model;
        }

        // Add current part to the ancestor path
        ancestorPath.Add(partId);

        var childEboms = await _spaceLinxContext.Eboms
            .Where(e => e.PartId == partId && e.DeletedBy == null)
            .ToListAsync();

        if (childEboms.Any())
        {
            model.Children = new List<PartDetailReadModel>();
            foreach (var ebom in childEboms)
            {
                // Create a copy of the ancestor path for this branch
                var branchPath = new HashSet<Guid>(ancestorPath);
                var child = await BuildBomHierarchyByLevelAsync(ebom.ChildPartId, branchPath, currentLevel + 1, maxLevel);
                if (child != null)
                {
                    child.EbomId = ebom.Id;
                    child.Quantity = ebom.Quantity;
                    model.Children.Add(child);
                }
            }
        }

        return model;
    }

    private async Task<PartDetailReadModel> BomAsync(Guid partId, int currentLevel, int maxLevel, HashSet<Guid> visitedParts)
    {
        if (visitedParts.Contains(partId))
        {
            return new PartDetailReadModel
            {
                Id = partId,
                Children = null
            };
        }

        var part = await _spaceLinxContext.Parts
            .Include(p => p.PartType)
            .ThenInclude(p => p.PartLevel)
            .Include(p => p.CountryOfOrigin)
            .Include(p => p.Subsystem)
            .FirstOrDefaultAsync(p => p.Id == partId && p.DeletedBy == null);

        if (part == null)
        {
            throw new ApplicationException("Part not found");
        }

        var model = mapper.Map<PartDetailReadModel>(part);

        if (currentLevel > maxLevel)
        {
            return model;
        }

        visitedParts.Add(partId);

        var childEboms = await _spaceLinxContext.Eboms
            .Where(e => e.PartId == partId && e.DeletedBy == null)
            .ToListAsync();

        if (childEboms.Any())
        {
            model.Children = new List<PartDetailReadModel>();

            foreach (var ebom in childEboms)
            {
                var nextLevel = currentLevel + 1;
                var childModel = await BomAsync(ebom.ChildPartId, nextLevel, maxLevel, visitedParts);

                if (childModel != null)
                {
                    childModel.Quantity = ebom.Quantity;
                    model.Children.Add(childModel);
                }
            }
        }

        return model;
    }

    public async Task<List<PartDetailReadModel>> GetFullParentHierarchyAsync(Guid partId)
    {
        var ancestorPath = new HashSet<Guid>();

        var root = await _spaceLinxContext.Parts
            .Include(p => p.PartType)
            .ThenInclude(p => p.PartLevel)
            .Include(p => p.Subsystem)
            .FirstOrDefaultAsync(p => p.Id == partId && p.DeletedBy == null);

        if (root == null)
            return new List<PartDetailReadModel>();

        var rootModel = mapper.Map<PartDetailReadModel>(root);
        var parents = await BuildFullParentHierarchyAsync(partId, ancestorPath);
        rootModel.Children = parents;

        return new List<PartDetailReadModel> { rootModel };
    }


    public async Task<List<PartDetailReadModel>> GetParentHierarchyByLevelAsync(Guid partId, int maxLevel)
    {
        var ancestorPath = new HashSet<Guid>();

        var root = await _spaceLinxContext.Parts
            .Include(p => p.PartType)
            .ThenInclude(p => p.PartLevel)
            .Include(p => p.Subsystem)
            .FirstOrDefaultAsync(p => p.Id == partId && p.DeletedBy == null);

        if (root == null)
            return new List<PartDetailReadModel>();

        var rootModel = mapper.Map<PartDetailReadModel>(root);
        var parents = await BuildParentHierarchyByLevelAsync(partId, ancestorPath, 1, maxLevel);
        rootModel.Children = parents;

        return new List<PartDetailReadModel> { rootModel };
    }

    private async Task<List<PartDetailReadModel>> BuildFullParentHierarchyAsync(Guid partId, HashSet<Guid> ancestorPath)
    {
        // Check if this part is already in the current path (circular reference)
        if (ancestorPath.Contains(partId))
        {
            // Circular reference detected - return empty list
            return new List<PartDetailReadModel>();
        }

        // Add current part to the ancestor path
        ancestorPath.Add(partId);

        // Get all parent parts (parts that have this part as a child in their EBOM)
        var parentEboms = await _spaceLinxContext.Eboms
            .Where(e => e.ChildPartId == partId && e.DeletedBy == null)
            .Include(e => e.Part)
                .ThenInclude(p => p.PartType)
                .ThenInclude(pt => pt.PartLevel)
            .Include(e => e.Part)
                .ThenInclude(p => p.Subsystem)
            .ToListAsync();

        var parentParts = new List<PartDetailReadModel>();

        foreach (var ebom in parentEboms)
        {
            if (ebom.Part == null)
                continue;

            var parentModel = mapper.Map<PartDetailReadModel>(ebom.Part);
            parentModel.Quantity = ebom.Quantity;

            // Recursively get the parents of this parent
            var branchPath = new HashSet<Guid>(ancestorPath);
            var grandParents = await BuildFullParentHierarchyAsync(ebom.PartId, branchPath);

            if (grandParents.Any())
            {
                parentModel.Children = grandParents;
            }

            parentParts.Add(parentModel);
        }

        return parentParts;
    }

    private async Task<List<PartDetailReadModel>> BuildParentHierarchyByLevelAsync(Guid partId, HashSet<Guid> ancestorPath, int currentLevel, int maxLevel)
    {
        // Check if this part is already in the current path (circular reference)
        if (ancestorPath.Contains(partId))
        {
            // Circular reference detected - return empty list
            return new List<PartDetailReadModel>();
        }

        // Add current part to the ancestor path
        ancestorPath.Add(partId);

        // Get all parent parts (parts that have this part as a child in their EBOM)
        var parentEboms = await _spaceLinxContext.Eboms
            .Where(e => e.ChildPartId == partId && e.DeletedBy == null)
            .Include(e => e.Part)
                .ThenInclude(p => p.PartType)
                .ThenInclude(pt => pt.PartLevel)
            .Include(e => e.Part)
                .ThenInclude(p => p.Subsystem)
            .ToListAsync();

        var parentParts = new List<PartDetailReadModel>();

        foreach (var ebom in parentEboms)
        {
            if (ebom.Part == null)
                continue;

            var parentModel = mapper.Map<PartDetailReadModel>(ebom.Part);
            parentModel.Quantity = ebom.Quantity;

            // Check if we should continue going up the hierarchy
            if (currentLevel < maxLevel)
            {
                // Recursively get the parents of this parent
                var branchPath = new HashSet<Guid>(ancestorPath);
                var grandParents = await BuildParentHierarchyByLevelAsync(ebom.PartId, branchPath, currentLevel + 1, maxLevel);

                if (grandParents.Any())
                {
                    parentModel.Children = grandParents;
                }
            }

            parentParts.Add(parentModel);
        }

        return parentParts;
    }

    public async Task<List<FlatBomItem>> GetFlatBomAsync(Guid partId)
    {
        var flatBom = new List<FlatBomItem>();

        var parentPart = await _spaceLinxContext.Parts
            .Include(p => p.PartType)
            .ThenInclude(p => p.PartLevel)
            .Include(p => p.CountryOfOrigin)
            .Include(p => p.Subsystem)
            .FirstOrDefaultAsync(p => p.Id == partId && p.DeletedBy == null);

        if (parentPart == null)
            return flatBom;

        flatBom.Add(new FlatBomItem
        {
            Level = 0,
            HierarchicalNumber = "1",
            Id = parentPart.Id,
            ParentPartId = null,
            EbomId = null,
            PartNumberSuffix = parentPart.PartNumberSuffix,
            PartNumber = parentPart.PartNumber,
            Name = parentPart.Name,
            ShortDescription = parentPart.ShortDescription,
            Quantity = 1,
            PartTypeId = parentPart.PartTypeId,
            PartTypeName = parentPart.PartType?.Name ?? string.Empty,
            PartTypeCategory = parentPart.PartType?.Category,
            Status = parentPart.Status,
            MakeBuy = parentPart.MakeBuy,
            IsSerialNumberRequired = parentPart.IsSerialNumberRequired,
            ManufacturingPartNumber = parentPart.ManufacturingPartNumber,
            ManufacturerName = parentPart.ManufacturerName,
            Trl = parentPart.Trl,
            SpaceQualified = parentPart.SpaceQualified,
            ReferenceNumber = parentPart.ReferenceNumber,
            Weight = parentPart.Weight,
            HasBom = parentPart.HasBom,
            Material = parentPart.Material,
            Grade = parentPart.Grade,
            CountryOfOriginId = parentPart.CountryOfOriginId,
            CountryOfOriginName = parentPart.CountryOfOrigin?.Name ?? string.Empty,
            SubsystemName = parentPart.Subsystem?.Name,
            PartLevelName = parentPart.PartType?.PartLevel?.Name
        });

        var childEboms = await _spaceLinxContext.Eboms
            .Where(e => e.PartId == partId && e.DeletedBy == null)
            .Include(e => e.ChildPart)
                .ThenInclude(p => p.PartType)
                .ThenInclude(pt => pt.PartLevel)
            .Include(e => e.ChildPart)
                .ThenInclude(p => p.CountryOfOrigin)
            .Include(e => e.ChildPart)
                .ThenInclude(p => p.Subsystem)
            .ToListAsync();

        int childIndex = 1;
        foreach (var ebom in childEboms)
        {
            if (ebom.ChildPart == null)
                continue;

            var childPart = ebom.ChildPart;

            flatBom.Add(new FlatBomItem
            {
                Level = 1,
                HierarchicalNumber = $"1.{childIndex}",
                Id = childPart.Id,
                ParentPartId = partId,
                EbomId = ebom.Id,
                PartNumberSuffix = childPart.PartNumberSuffix,
                PartNumber = childPart.PartNumber,
                Name = childPart.Name,
                ShortDescription = childPart.ShortDescription,
                Quantity = ebom.Quantity,
                PartTypeId = childPart.PartTypeId,
                PartTypeName = childPart.PartType?.Name ?? string.Empty,
                PartTypeCategory = childPart.PartType?.Category,
                Status = childPart.Status,
                MakeBuy = childPart.MakeBuy,
                IsSerialNumberRequired = childPart.IsSerialNumberRequired,
                ManufacturingPartNumber = childPart.ManufacturingPartNumber,
                ManufacturerName = childPart.ManufacturerName,
                Trl = childPart.Trl,
                SpaceQualified = childPart.SpaceQualified,
                ReferenceNumber = childPart.ReferenceNumber,
                Weight = childPart.Weight,
                HasBom = childPart.HasBom,
                Material = childPart.Material,
                Grade = childPart.Grade,
                CountryOfOriginId = childPart.CountryOfOriginId,
                CountryOfOriginName = childPart.CountryOfOrigin?.Name ?? string.Empty,
                SubsystemName = childPart.Subsystem?.Name,
                PartLevelName = childPart.PartType?.PartLevel?.Name
            });

            childIndex++;
        }

        return flatBom;
    }

    public async Task<List<SubsystemBomHierarchyReadModel>> GetBomHierarchyBySubsystemAsync(Guid partId)
    {
        // Get the full BOM hierarchy first
        var fullBom = await GetFullBomHierarchyAsync(partId);
        if (fullBom == null)
            return new List<SubsystemBomHierarchyReadModel>();

        // Collect all parts with their subsystem info and parent relationship
        // EffectiveSubsystemName is either the part's own subsystem or inherited from the nearest ancestor
        var allParts = new List<(PartDetailReadModel Part, Guid? ParentId, string? ParentEffectiveSubsystemName, string? EffectiveSubsystemName)>();
        CollectAllPartsWithParent(fullBom, allParts, null, null);

        // Get all unique subsystems from the collected parts (group by EffectiveSubsystemName), excluding the root part (partId)
        var subsystemGroups = allParts
            .Where(p => p.Part.Id != partId)
            .GroupBy(p => p.EffectiveSubsystemName)
            .OrderBy(g => g.Key ?? "ZZZ") // Unassigned parts go last
            .ToList();

        var result = new List<SubsystemBomHierarchyReadModel>();

        foreach (var group in subsystemGroups)
        {
            var subsystemBom = new SubsystemBomHierarchyReadModel
            {
                SubsystemId = null,
                SubsystemCode = group.Key ?? "UNASSIGNED",
                SubsystemName = group.Key ?? "Unassigned Parts",
                Parts = new List<PartDetailReadModel>()
            };

            // Build hierarchy for parts in this subsystem
            var subsystemParts = group.ToList();
            var partIds = new HashSet<Guid>(subsystemParts.Where(p => p.Part.Id.HasValue).Select(p => p.Part.Id!.Value));

            // Find root parts for this subsystem (parts whose parent's effective subsystem is different)
            var rootParts = subsystemParts
                .Where(p => !p.ParentId.HasValue ||
                            p.ParentEffectiveSubsystemName != group.Key ||
                            !partIds.Contains(p.ParentId.Value))
                .Select(p => p.Part)
                .ToList();

            // Build hierarchical tree for each root part
            foreach (var rootPart in rootParts)
            {
                var hierarchicalPart = BuildSubsystemHierarchy(rootPart, fullBom, group.Key);
                if (hierarchicalPart != null)
                {
                    subsystemBom.Parts.Add(hierarchicalPart);
                }
            }

            result.Add(subsystemBom);
        }

        return result;
    }

    private void CollectAllPartsWithParent(PartDetailReadModel part, List<(PartDetailReadModel Part, Guid? ParentId, string? ParentEffectiveSubsystemName, string? EffectiveSubsystemName)> allParts, Guid? parentId, string? inheritedSubsystemName)
    {
        // Determine effective subsystem: use part's own subsystem if defined, otherwise inherit from ancestor
        var effectiveSubsystemName = !string.IsNullOrEmpty(part.SubsystemName)
            ? part.SubsystemName
            : inheritedSubsystemName;

        allParts.Add((part, parentId, inheritedSubsystemName, effectiveSubsystemName));

        if (part.Children != null && part.Children.Any())
        {
            foreach (var child in part.Children)
            {
                // Pass the current part's effective subsystem to children for inheritance
                CollectAllPartsWithParent(child, allParts, part.Id, effectiveSubsystemName);
            }
        }
    }

    private PartDetailReadModel? BuildSubsystemHierarchy(PartDetailReadModel part, PartDetailReadModel fullBom, string? targetSubsystemName)
    {
        // Find this part in the full BOM to get its children
        var partInBom = FindPartInBom(fullBom, part.Id);
        if (partInBom == null)
            return null;

        // Clone the part
        var result = ClonePartWithoutChildren(partInBom);

        // Add children that belong to the same subsystem (using effective subsystem)
        if (partInBom.Children != null && partInBom.Children.Any())
        {
            result.Children = new List<PartDetailReadModel>();
            foreach (var child in partInBom.Children)
            {
                // Calculate child's effective subsystem: use its own if defined, otherwise inherit from parent (targetSubsystemName)
                var childEffectiveSubsystem = !string.IsNullOrEmpty(child.SubsystemName)
                    ? child.SubsystemName
                    : targetSubsystemName;

                if (childEffectiveSubsystem == targetSubsystemName)
                {
                    var childHierarchy = BuildSubsystemHierarchy(child, fullBom, targetSubsystemName);
                    if (childHierarchy != null)
                    {
                        result.Children.Add(childHierarchy);
                    }
                }
            }
        }

        return result;
    }

    private PartDetailReadModel? FindPartInBom(PartDetailReadModel bom, Guid? partId)
    {
        if (!partId.HasValue)
            return null;

        if (bom.Id == partId)
            return bom;

        if (bom.Children != null)
        {
            foreach (var child in bom.Children)
            {
                var found = FindPartInBom(child, partId);
                if (found != null)
                    return found;
            }
        }

        return null;
    }

    private PartDetailReadModel ClonePartWithoutChildren(PartDetailReadModel part)
    {
        return new PartDetailReadModel
        {
            Id = part.Id,
            EbomId = part.EbomId,
            Name = part.Name,
            ShortDescription = part.ShortDescription,
            PartTypeId = part.PartTypeId,
            PartTypeName = part.PartTypeName,
            PartTypeCategory = part.PartTypeCategory,
            PartNumberSuffix = part.PartNumberSuffix,
            PartNumber = part.PartNumber,
            Quantity = part.Quantity,
            Status = part.Status,
            UnitOfMeasureId = part.UnitOfMeasureId,
            MakeBuy = part.MakeBuy,
            IsSerialNumberRequired = part.IsSerialNumberRequired,
            ManufacturingPartNumber = part.ManufacturingPartNumber,
            ManufacturerName = part.ManufacturerName,
            Trl = part.Trl,
            SpaceQualified = part.SpaceQualified,
            ReferenceNumber = part.ReferenceNumber,
            Weight = part.Weight,
            HasBom = part.HasBom,
            Material = part.Material,
            Grade = part.Grade,
            CountryOfOriginId = part.CountryOfOriginId,
            CountryOfOriginName = part.CountryOfOriginName,
            AssemblyLocationId = part.AssemblyLocationId,
            AssemblyLocationName = part.AssemblyLocationName,
            SubsystemName = part.SubsystemName,
            PartLevelName = part.PartLevelName,
            Children = new List<PartDetailReadModel>()
        };
    }

    public async Task<List<LocationBomHierarchyReadModel>> GetBomHierarchyByLocationAsync(Guid partId)
    {
        // Get the full BOM hierarchy first
        var fullBom = await GetFullBomHierarchyAsync(partId);
        if (fullBom == null)
            return new List<LocationBomHierarchyReadModel>();

        // Collect all parts with their location, subsystem info, and parent relationship
        // EffectiveSubsystemName is either the part's own subsystem or inherited from the nearest ancestor
        var allParts = new List<(PartDetailReadModel Part, Guid? ParentId, string? ParentEffectiveSubsystemName, string? EffectiveSubsystemName, Guid? EffectiveLocationId, string? EffectiveLocationName)>();
        CollectAllPartsWithLocationAndSubsystem(fullBom, allParts, null, null, null, null);

        // First, group by effective location (excluding the root part)
        var locationGroups = allParts
            .Where(p => p.Part.Id != partId)
            .GroupBy(p => new { p.EffectiveLocationId, p.EffectiveLocationName })
            .OrderBy(g => g.Key.EffectiveLocationName ?? "ZZZ") // Unassigned parts go last
            .ToList();

        var result = new List<LocationBomHierarchyReadModel>();

        foreach (var locationGroup in locationGroups)
        {
            var locationBom = new LocationBomHierarchyReadModel
            {
                LocationId = locationGroup.Key.EffectiveLocationId,
                LocationName = locationGroup.Key.EffectiveLocationName ?? "Unassigned Location",
                Subsystems = new List<SubsystemBomHierarchyReadModel>()
            };

            // Within each location, group by subsystem
            var subsystemGroups = locationGroup
                .GroupBy(p => p.EffectiveSubsystemName)
                .OrderBy(g => g.Key ?? "ZZZ") // Unassigned subsystems go last
                .ToList();

            foreach (var subsystemGroup in subsystemGroups)
            {
                var subsystemBom = new SubsystemBomHierarchyReadModel
                {
                    SubsystemId = null,
                    SubsystemCode = subsystemGroup.Key ?? "UNASSIGNED",
                    SubsystemName = subsystemGroup.Key ?? "Unassigned Parts",
                    Parts = new List<PartDetailReadModel>()
                };

                // Build hierarchy for parts in this subsystem within this location
                var subsystemParts = subsystemGroup.ToList();
                var partIds = new HashSet<Guid>(subsystemParts.Where(p => p.Part.Id.HasValue).Select(p => p.Part.Id!.Value));

                // Find root parts for this subsystem within this location
                // (parts whose parent's effective subsystem or location is different)
                var rootParts = subsystemParts
                    .Where(p => !p.ParentId.HasValue ||
                                p.ParentEffectiveSubsystemName != subsystemGroup.Key ||
                                !partIds.Contains(p.ParentId.Value))
                    .Select(p => p.Part)
                    .ToList();

                // Build hierarchical tree for each root part within this location and subsystem
                foreach (var rootPart in rootParts)
                {
                    var hierarchicalPart = BuildLocationSubsystemHierarchy(
                        rootPart,
                        fullBom,
                        locationGroup.Key.EffectiveLocationId,
                        locationGroup.Key.EffectiveLocationName,
                        subsystemGroup.Key);
                    if (hierarchicalPart != null)
                    {
                        subsystemBom.Parts.Add(hierarchicalPart);
                    }
                }

                locationBom.Subsystems.Add(subsystemBom);
            }

            result.Add(locationBom);
        }

        return result;
    }

    private void CollectAllPartsWithLocationAndSubsystem(
        PartDetailReadModel part,
        List<(PartDetailReadModel Part, Guid? ParentId, string? ParentEffectiveSubsystemName, string? EffectiveSubsystemName, Guid? EffectiveLocationId, string? EffectiveLocationName)> allParts,
        Guid? parentId,
        string? inheritedSubsystemName,
        Guid? inheritedLocationId,
        string? inheritedLocationName)
    {
        // Determine effective subsystem: use part's own subsystem if defined, otherwise inherit from ancestor
        var effectiveSubsystemName = !string.IsNullOrEmpty(part.SubsystemName)
            ? part.SubsystemName
            : inheritedSubsystemName;

        // Determine effective location: use part's own assembly location if defined, otherwise inherit from ancestor
        var effectiveLocationId = part.AssemblyLocationId ?? inheritedLocationId;
        var effectiveLocationName = !string.IsNullOrEmpty(part.AssemblyLocationName)
            ? part.AssemblyLocationName
            : inheritedLocationName;

        allParts.Add((part, parentId, inheritedSubsystemName, effectiveSubsystemName, effectiveLocationId, effectiveLocationName));

        if (part.Children != null && part.Children.Any())
        {
            foreach (var child in part.Children)
            {
                // Pass the current part's effective subsystem and location to children for inheritance
                CollectAllPartsWithLocationAndSubsystem(child, allParts, part.Id, effectiveSubsystemName, effectiveLocationId, effectiveLocationName);
            }
        }
    }

    private PartDetailReadModel? BuildLocationSubsystemHierarchy(
        PartDetailReadModel part,
        PartDetailReadModel fullBom,
        Guid? targetLocationId,
        string? targetLocationName,
        string? targetSubsystemName)
    {
        // Find this part in the full BOM to get its children
        var partInBom = FindPartInBom(fullBom, part.Id);
        if (partInBom == null)
            return null;

        // Clone the part
        var result = ClonePartWithoutChildren(partInBom);

        // Add children that belong to the same location and subsystem (using effective values)
        if (partInBom.Children != null && partInBom.Children.Any())
        {
            result.Children = new List<PartDetailReadModel>();
            foreach (var child in partInBom.Children)
            {
                // Calculate child's effective location
                var childEffectiveLocationId = child.AssemblyLocationId ?? targetLocationId;
                var childEffectiveLocationName = !string.IsNullOrEmpty(child.AssemblyLocationName)
                    ? child.AssemblyLocationName
                    : targetLocationName;

                // Calculate child's effective subsystem
                var childEffectiveSubsystem = !string.IsNullOrEmpty(child.SubsystemName)
                    ? child.SubsystemName
                    : targetSubsystemName;

                // Only include children that belong to the same location and subsystem
                if (childEffectiveLocationId == targetLocationId &&
                    childEffectiveSubsystem == targetSubsystemName)
                {
                    var childHierarchy = BuildLocationSubsystemHierarchy(
                        child,
                        fullBom,
                        targetLocationId,
                        targetLocationName,
                        targetSubsystemName);
                    if (childHierarchy != null)
                    {
                        result.Children.Add(childHierarchy);
                    }
                }
            }
        }

        return result;
    }
}
