# SpaceLinx.Api Performance Audit Report

**Date:** December 18, 2025
**Scope:** Database calls and API execution performance bottlenecks

---

## Executive Summary

A comprehensive analysis of the SpaceLinx.Api codebase revealed **75+ performance issues** across the application. The most critical findings include a bug causing incorrect data filtering, thread-blocking code that can cause deadlocks, and complete absence of pagination on all list endpoints.

| Severity | Count | Impact |
|----------|-------|--------|
| Critical | 3 | System stability, data correctness |
| High | 39+ | Performance degradation, scalability |
| Medium | 33+ | Inefficiency, resource waste |

---

## Critical Issues

### 1. Bug: Missing Filter Assignment in GenericRestController

**File:** `SpaceLinx.Api/Controllers/GenericRestController.cs`
**Line:** 185

```csharp
// CURRENT (BUG):
query.Where(x => x.DeletedAt == null && x.IsActive == true);

// SHOULD BE:
query = query.Where(x => x.DeletedAt == null && x.IsActive == true);
```

**Impact:** The `GetActiveAsync()` method does NOT apply the `IsActive` filter - the LINQ result is discarded. This affects all 81 controllers that inherit from `GenericRestController`. The `/Active` endpoint returns ALL records instead of only active ones.

**Fix Required:** Assign the result back to the `query` variable.

---

### 2. Thread Blocking with `.Result`

**File:** `SpaceLinx.Api/Controllers/WorkOrderTaskController.cs`
**Lines:** 67-68

```csharp
// CURRENT (BLOCKING):
var filePath = createdImage?.Result?.FilePath;
var taskResponse = $@"{{...""filePath"": ""{createdImage?.Result?.FilePath}""...}}";

// SHOULD BE:
var createdImageResult = await createdImage;
var filePath = createdImageResult?.FilePath;
```

**Impact:** Using `.Result` on an async Task blocks the thread and can cause deadlocks in ASP.NET Core. This is a well-documented anti-pattern.

**Fix Required:** Properly await the async operation.

---

### 3. No Pagination on List Endpoints

**File:** `SpaceLinx.Api/Controllers/GenericRestController.cs`
**Lines:** 130-148, 151-169, 171-188

All three list methods in the base controller return unbounded result sets:

| Endpoint | Method | Issue |
|----------|--------|-------|
| `GET /api/{entity}` | `GetAsync()` | No Skip/Take |
| `GET /api/{entity}/Active` | `GetActiveAsync()` | No Skip/Take |
| `GET /api/{entity}/Lookup` | `GetForLookupAsync()` | No Skip/Take |

**Impact:**
- Memory exhaustion with large datasets
- API timeouts
- Network bandwidth consumption
- Potential DoS vulnerability
- All 81 controllers affected

**Fix Required:** Add pagination parameters and implement `Skip()`/`Take()` with sensible defaults.

---

## High Severity Issues

### N+1 Query Patterns

#### PartController - Image Fetching

**File:** `SpaceLinx.Api/Controllers/PartController.cs`
**Lines:** 23-44

```csharp
var parts = await spaceLinxContext.Parts...ToListAsync();

foreach (var part in partImage)  // N+1 STARTS HERE
{
    part.ImageUrl = await spaceLinxContext.Images
        .Where(img => img.EntityType == "Part" && img.EntityId == part.Id...)
        .Select(img => img.FilePath)
        .FirstOrDefaultAsync();  // QUERY PER PART
}
```

**Also occurs at:** Lines 298-333 (`GetVersionsBySuffix`)

**Fix:** Batch load all images in a single query, then join in memory.

---

#### GoodsReceiptNoteController - Multiple Queries Per Line Item

**File:** `SpaceLinx.Api/Controllers/GoodsReceiptNoteController.cs`
**Lines:** 214-285 (`QualityChecked`)

```csharp
foreach (var line in grnRecord.GrnLineItems)
{
    var stock = await spaceLinxContext.InventoryStocks
        .FirstOrDefaultAsync(s => s.PartId == line.PartId...);  // QUERY 1

    var part = await spaceLinxContext.InventoryParts
        .FirstOrDefaultAsync(p => p.PartId == line.PartId...);  // QUERY 2

    await spaceLinxContext.SaveChangesAsync();  // SAVE PER ITEM!
}
```

**Also occurs at:** Lines 108-177 (`UpdateGrn`)

**Fix:** Batch load all InventoryStocks and InventoryParts before the loop; move SaveChangesAsync outside the loop.

---

#### BomService - Recursive Part Queries

**File:** `SpaceLinx.Api/Services/BomService.cs`
**Lines:** 134-181

```csharp
private async Task<PartDetailReadModel> BuildFullBomHierarchyAsync(...)
{
    var part = await _spaceLinxContext.Parts
        .Include(p => p.PartType)
        .Include(p => p.CountryOfOrigin)
        .FirstOrDefaultAsync(p => p.Id == partId...);  // QUERY PER NODE

    var childEboms = await _spaceLinxContext.Eboms
        .Where(e => e.PartId == partId...)
        .ToListAsync();  // QUERY PER NODE

    foreach (var ebom in childEboms)
    {
        var child = await BuildFullBomHierarchyAsync(...);  // RECURSIVE
    }
}
```

**Impact:** For a BOM tree with 100 nodes, this executes 200 queries (2 per node).

**Mitigation:** The caching layer helps, but cache misses are expensive. Consider loading entire BOM in fewer queries using CTEs or batch loading.

---

### SaveChangesAsync Called Inside Loops

| File | Lines | Context |
|------|-------|---------|
| `GoodsReceiptNoteController.cs` | 284 | `QualityChecked` - per line item |
| `GoodsReceiptNoteController.cs` | 154 | `UpdateGrn` - per line item |
| `PurchaseOrderController.cs` | 131 | `CreatePurchaseOrder` - per line item |
| `PurchaseOrderController.cs` | 259 | `UpdatePurchaseOrder` - per new item |
| `PurchaseOrderController.cs` | 281 | `UpdatePurchaseOrder` - per existing item |

**Impact:** Each `SaveChangesAsync()` creates a separate database round-trip. For 50 line items, this means 50 database transactions instead of 1.

**Fix:** Move `SaveChangesAsync()` outside the loop. EF Core batches all changes in a single transaction.

---

### Synchronous Database Calls in Async Methods

The following locations use synchronous `.ToList()` where `.ToListAsync()` should be used:

#### Controllers

| File | Lines | Method |
|------|-------|--------|
| `EBomController.cs` | 102 | `GetFullBomHierarchyConsolidated` |
| `EBomController.cs` | 150 | `GetFullBomHierarchyList` |
| `EcoController.cs` | 266, 284, 291, 298 | Error handling in catch blocks |
| `GuideStepEquipmentController.cs` | 40, 55 | `GetByStep`, `GetByGuide` |
| `GuideController.cs` | 506 | Non-released parts filtering |
| `PartController.cs` | 247, 383 | `GetUniquePartsWithoutObsoleteParts`, `GetUniqueReleaseParts` |
| `ProgramController.cs` | 45-46 | Anonymous object projection |
| `PurchaseOrderController.cs` | 209, 217, 221, 362 | Line item operations |
| `UserController.cs` | 217 | Role filtering |

#### Services

| File | Lines | Method |
|------|-------|--------|
| `GuideService.cs` | 72, 95, 229, 246 | Multiple list operations |
| `BaseService.cs` | 23 | `GetEffectiveUserRoleId` - **RUNS ON EVERY REQUEST** |
| `BomCacheRefreshService.cs` | 65-66 | Batch grouping |
| `ApprovalService.cs` | 58, 74 | Approval operations |
| `WorkOrderService.cs` | 138, 184, 194 | Record casting |

**Impact:** Synchronous calls block the thread pool, reducing scalability under load.

**Fix:** Replace `.ToList()` with `.ToListAsync()` and ensure proper async/await chain.

---

## Medium Severity Issues

### Inefficient LINQ Patterns

#### Count > 0 Instead of Any()

**File:** `SpaceLinx.Api/Services/EcoPartService.cs`
**Lines:** 13-15

```csharp
// CURRENT (INEFFICIENT):
int count = await spaceLinxContext.EcoParts.AsNoTracking()
    .CountAsync(x => x.EcoId == ecoEntityId && x.PartId == ecoPart.PartId...);
if (count > 0)

// SHOULD BE:
if (await spaceLinxContext.EcoParts.AsNoTracking()
    .AnyAsync(x => x.EcoId == ecoEntityId && x.PartId == ecoPart.PartId...))
```

**Impact:** `CountAsync()` scans all matching rows; `AnyAsync()` stops at the first match.

---

#### Client-Side Filtering with N+1 Subquery

**File:** `SpaceLinx.Api/Controllers/PartController.cs`
**Lines:** 240-247

```csharp
// CURRENT (N+1):
var draftParts = await spaceLinxContext.Parts...ToListAsync();
var filteredParts = draftParts
    .Where(p => !spaceLinxContext.Eboms.Any(e => e.PartId == p.Id))  // DB HIT PER ROW
    .ToList();

// SHOULD BE:
var ebomPartIds = await spaceLinxContext.Eboms
    .Select(e => e.PartId).Distinct().ToListAsync();
var filteredParts = await spaceLinxContext.Parts
    .Where(p => ... && !ebomPartIds.Contains(p.Id.Value))
    .ToListAsync();
```

---

#### Subquery in Select Projection

**File:** `SpaceLinx.Api/Controllers/EcoController.cs`
**Lines:** 60-92

```csharp
.Select(ep => new
{
    PartDetails = spaceLinxContext.Parts  // SUBQUERY PER ROW
        .Where(p => p.Id == ep.PartId...)
        .Select(p => new { ... })
        .FirstOrDefault()
})
```

**Fix:** Use Include + ThenInclude, or fetch Parts separately and join in memory.

---

#### Inefficient GroupBy Patterns

**Files:**
- `PartController.cs:112-122, 127-137`
- `GuideService.cs:68-70, 91-93, 215`

```csharp
// CURRENT:
.GroupBy(x => x.PartNumberSuffix)
.Select(x => x.OrderByDescending(x => x.Version).FirstOrDefault())

// IN .NET 6+ CAN USE:
.GroupBy(x => x.PartNumberSuffix)
.Select(x => x.MaxBy(p => p.Version))
```

---

#### Include with Where Filter

**Files:**
- `UserService.cs:14, 17`
- `UserController.cs:23, 40, 52, 64, 84`

```csharp
// PROBLEMATIC:
.Include(u => u.UserRoles.Where(ur => ur.Role.Id == UserRoleId))
```

**Issue:** Filtering within Include can cause EF Core materialization issues. Filter after the query or use a separate query.

---

### Missing Caching Opportunities

#### BaseService Role Resolution

**File:** `SpaceLinx.Api/Services/BaseService.cs`
**Lines:** 21-31

```csharp
var userRoles = _spaceLinxContext.UserRoles
    .Where(x => x.User.Email.ToLower() == UserEmail)
    .ToList();  // RUNS ON EVERY PROPERTY ACCESS
```

**Impact:** This query runs every time `UserRoleId` is accessed. For a request that accesses this property 5 times, that's 5 identical database queries.

**Fix:** Add request-scoped caching or lazy initialization with caching.

---

#### Heavy Detail Queries Without Caching

| Service | Method | Queries Per Call |
|---------|--------|------------------|
| `GuideService` | `GetGuideDetailsAsync` | 5 |
| `WorkOrderService` | `GetWorkOrderDetailsAsync` | 8+ |
| `EcoNotificationService` | `GetEcoRecipientsAsync` | 2+ |

**Fix:** Implement composite DTO caching with appropriate TTL.

---

### Redis KEYS Command Usage

**File:** `SpaceLinx.Api/Services/CacheService.cs`
**Line:** 35

```csharp
var keys = _connectionMultiplexer.GetServer(endpoint).Keys().ToArray();
```

**Impact:** The Redis `KEYS` command is O(N) and blocks the Redis server. On a cache with 100,000 keys, this can block for seconds.

**Fix:** Use `SCAN` iterator pattern instead:
```csharp
var server = _connectionMultiplexer.GetServer(endpoint);
await foreach (var key in server.KeysAsync())
{
    await db.KeyDeleteAsync(key);
}
```

---

## Affected Endpoints Summary

### Endpoints Without Pagination (40+)

All endpoints inheriting from `GenericRestController`:
- `GET /api/Part`, `GET /api/Part/Active`, `GET /api/Part/Lookup`
- `GET /api/Ebom`, `GET /api/Eco`, `GET /api/Guide`
- `GET /api/WorkOrder`, `GET /api/PurchaseOrder`
- ... and 70+ more

### Endpoints with N+1 Issues

- `GET /api/Part` - Image loading
- `GET /api/Part/Versions/{suffix}` - Image loading
- `PUT /api/GoodsReceiptNote/{id}/QualityChecked` - Stock/Part lookups
- `PUT /api/GoodsReceiptNote/{id}` - Line item updates
- `POST /api/PurchaseOrder` - Line item creation
- `PUT /api/PurchaseOrder/{id}` - Line item updates

---

## Recommendations by Priority

### Immediate (Critical)

1. **Fix GenericRestController bug** - Line 185, assign Where result
2. **Fix WorkOrderTaskController blocking** - Lines 67-68, await properly
3. **Add pagination** - Default limit of 1000, add Skip/Take

### Short-term (High)

4. **Remove SaveChangesAsync from loops** - Batch all changes, save once
5. **Fix N+1 in PartController** - Batch load images
6. **Fix N+1 in GoodsReceiptNoteController** - Batch load stocks/parts
7. **Convert sync to async** - Replace .ToList() with .ToListAsync()

### Medium-term

8. **Cache BaseService role resolution** - Request-scoped caching
9. **Implement composite caching** - For heavy detail queries
10. **Replace Redis KEYS** - Use SCAN in CacheService
11. **Optimize GroupBy patterns** - Use MaxBy in .NET 6+
12. **Add query complexity guards** - For nested includes

---

## Files Requiring Changes

| File | Issues | Priority |
|------|--------|----------|
| `GenericRestController.cs` | Bug, pagination | Critical |
| `WorkOrderTaskController.cs` | Thread blocking | Critical |
| `PartController.cs` | N+1, sync calls, LINQ | High |
| `GoodsReceiptNoteController.cs` | N+1, SaveChanges in loop | High |
| `PurchaseOrderController.cs` | SaveChanges in loop, sync calls | High |
| `BaseService.cs` | Sync call, no caching | High |
| `BomService.cs` | N+1 on cache miss | Medium |
| `CacheService.cs` | Redis KEYS usage | Medium |
| `GuideService.cs` | Sync calls, GroupBy | Medium |
| `EcoController.cs` | Subquery in Select | Medium |
| `UserController.cs` | Include with Where | Medium |

---

## Appendix: Full Issue Inventory

### Critical (3)
1. GenericRestController:185 - Missing filter assignment
2. WorkOrderTaskController:67-68 - Thread blocking with .Result
3. GenericRestController - No pagination (affects 81 controllers)

### High - N+1 Patterns (9)
1. PartController:37-40 - Image per part
2. PartController:316-319 - Image per part (GetVersionsBySuffix)
3. GoodsReceiptNoteController:214-285 - Stocks/Parts per line
4. GoodsReceiptNoteController:108-177 - Multiple queries per line
5. GoodsReceiptNoteService:26-112 - Stocks/Parts per line
6. BomService:143-178 - Recursive part queries
7. BomService:183-233 - Recursive by level
8. BomService:235-287 - BomAsync recursive
9. EcoController:60-92 - Subquery in Select

### High - SaveChanges in Loops (5)
1. GoodsReceiptNoteController:284
2. GoodsReceiptNoteController:154
3. PurchaseOrderController:131
4. PurchaseOrderController:259
5. PurchaseOrderController:281

### High - Sync Calls in Async (25+)
See "Synchronous Database Calls" section above.

### Medium - Inefficient LINQ (18)
See "Inefficient LINQ Patterns" section above.

### Medium - Missing Caching (3)
1. BaseService.GetEffectiveUserRoleId
2. GuideService.GetGuideDetailsAsync
3. WorkOrderService.GetWorkOrderDetailsAsync
