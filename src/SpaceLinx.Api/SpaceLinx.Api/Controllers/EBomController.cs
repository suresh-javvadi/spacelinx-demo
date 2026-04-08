using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using System.Text;
using ClosedXML.Excel;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class EBomController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IPartService partService, IBomService bomService) :
    GenericRestController<Ebom, EbomWriteModel, EbomUpdateModel, EbomReadModel, EbomRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("part/{partId}")]
    public async Task<List<EbomReadModel>> GetEbom(Guid partId)
    {
        var records = await spaceLinxContext.Eboms
            .AsNoTracking()
            .Include(x => x.Part)
            .ThenInclude(x => x.CountryOfOrigin)
            .Include(x => x.ChildPart)
            .ThenInclude(p => p.PartType)
            .ThenInclude(pt => pt.PartLevel)
            .Include(x => x.ChildPart)
            .ThenInclude(x => x.CountryOfOrigin)
            .Include(x => x.ChildPart)
            .ThenInclude(x => x.Subsystem)
            .Where(x => x.PartId == partId && x.Part.ItemType == null && (x.ChildPart.Status == PartStatus.Draft || x.ChildPart.Status == PartStatus.Release) && x.ChildPart.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<Ebom>, List<EbomReadModel>>(records);
    }

    [HttpGet("{partId}/bom/full")]
    public async Task<ActionResult<List<PartDetailReadModel>>> GetFullBomHierarchy(Guid partId)
    {
        var bom = await bomService.GetFullBomHierarchyAsync(partId);
        if (bom == null)
            return NotFound();

        // Return only children, excluding the root part (partId)
        return Ok(bom.Children ?? new List<PartDetailReadModel>());
    }

    [HttpGet("{partId}/bom/full/by-subsystem")]
    public async Task<ActionResult<List<SubsystemBomHierarchyReadModel>>> GetFullBomHierarchyBySubsystem(Guid partId)
    {
        var bom = await bomService.GetBomHierarchyBySubsystemAsync(partId);
        if (bom == null || !bom.Any())
            return NotFound();

        return Ok(bom);
    }

    [HttpGet("{partId}/bom/full/by-location")]
    public async Task<ActionResult<List<LocationBomHierarchyReadModel>>> GetFullBomHierarchyByLocation(Guid partId)
    {
        var bom = await bomService.GetBomHierarchyByLocationAsync(partId);
        if (bom == null || !bom.Any())
            return NotFound();

        return Ok(bom);
    }

    [HttpGet("{partId}/bom/full/flat")]
    public async Task<ActionResult<List<FlatBomItem>>> GetFullBomHierarchyFlat(Guid partId)
    {
        var bom = await bomService.GetFullBomHierarchyAsync(partId);
        if (bom == null)
            return NotFound();

        var flatList = new List<FlatBomItem>();
        FlattenBomToList(bom, flatList, 0, "1", null);

        return Ok(flatList);
    }

    [HttpGet("{partId}/bom/full/consolidated")]
    public async Task<ActionResult<List<ConsolidatedBomItem>>> GetFullBomHierarchyConsolidated(Guid partId)
    {
        var bom = await bomService.GetFullBomHierarchyAsync(partId);
        if (bom == null)
            return NotFound();

        // First flatten the BOM to get all parts with their quantities
        var flatList = new List<FlatBomItem>();
        FlattenBomToList(bom, flatList, 0, "1", null);

        // Group by part ID and sum quantities, excluding the root part (partId)
        var consolidated = flatList
            .Where(p => p.Id.HasValue && p.Id.Value != partId)
            .GroupBy(p => p.Id!.Value)
            .Select(g => new ConsolidatedBomItem
            {
                Id = g.Key,
                PartNumberSuffix = g.First().PartNumberSuffix,
                PartNumber = g.First().PartNumber,
                Name = g.First().Name,
                ShortDescription = g.First().ShortDescription,
                TotalQuantity = g.Sum(p => p.Quantity),
                PartTypeId = g.First().PartTypeId,
                PartTypeName = g.First().PartTypeName,
                PartTypeCategory = g.First().PartTypeCategory,
                Status = g.First().Status,
                MakeBuy = g.First().MakeBuy,
                IsSerialNumberRequired = g.First().IsSerialNumberRequired,
                ManufacturingPartNumber = g.First().ManufacturingPartNumber,
                ManufacturerName = g.First().ManufacturerName,
                Trl = g.First().Trl,
                SpaceQualified = g.First().SpaceQualified,
                ReferenceNumber = g.First().ReferenceNumber,
                Weight = g.First().Weight,
                Material = g.First().Material,
                Grade = g.First().Grade,
                CountryOfOriginId = g.First().CountryOfOriginId,
                CountryOfOriginName = g.First().CountryOfOriginName,
                AssemblyLocationId = g.First().AssemblyLocationId,
                AssemblyLocationName = g.First().AssemblyLocationName,
                SubsystemName = g.First().SubsystemName,
                PartLevelName = g.First().PartLevelName
            })
            .OrderBy(p => p.PartNumber)
            .ToList();

        return Ok(consolidated);
    }

    [HttpGet("{partId}/bom/full/list")]
    public async Task<ActionResult<List<BomListItem>>> GetFullBomHierarchyList(Guid partId)
    {
        var bom = await bomService.GetFullBomHierarchyAsync(partId);
        if (bom == null)
            return NotFound();

        // First flatten the BOM to get all parts with their quantities
        var flatList = new List<FlatBomItem>();
        FlattenBomToList(bom, flatList, 0, "1", null);

        // Map to BomListItem without consolidation (each occurrence listed separately), excluding the root part (partId)
        var list = flatList
            .Where(p => p.Id.HasValue && p.Id.Value != partId)
            .Select(p => new BomListItem
            {
                Id = p.Id!.Value,
                EbomId = p.EbomId,
                ParentPartId = p.ParentPartId,
                PartNumberSuffix = p.PartNumberSuffix,
                PartNumber = p.PartNumber,
                Name = p.Name,
                ShortDescription = p.ShortDescription,
                Quantity = p.Quantity,
                PartTypeId = p.PartTypeId,
                PartTypeName = p.PartTypeName,
                PartTypeCategory = p.PartTypeCategory,
                Status = p.Status,
                MakeBuy = p.MakeBuy,
                IsSerialNumberRequired = p.IsSerialNumberRequired,
                ManufacturingPartNumber = p.ManufacturingPartNumber,
                ManufacturerName = p.ManufacturerName,
                Trl = p.Trl,
                SpaceQualified = p.SpaceQualified,
                ReferenceNumber = p.ReferenceNumber,
                Weight = p.Weight,
                Material = p.Material,
                Grade = p.Grade,
                CountryOfOriginId = p.CountryOfOriginId,
                CountryOfOriginName = p.CountryOfOriginName,
                AssemblyLocationId = p.AssemblyLocationId,
                AssemblyLocationName = p.AssemblyLocationName,
                SubsystemName = p.SubsystemName,
                PartLevelName = p.PartLevelName
            })
            .OrderBy(p => p.PartNumber)
            .ToList();

        return Ok(list);
    }

    private void FlattenBomToList(PartDetailReadModel part, List<FlatBomItem> flatList, int level, string hierarchicalNumber, Guid? parentPartId)
    {
        flatList.Add(new FlatBomItem
        {
            Level = level,
            HierarchicalNumber = hierarchicalNumber,
            Id = part.Id,
            ParentPartId = parentPartId,
            EbomId = part.EbomId,
            PartNumberSuffix = part.PartNumberSuffix,
            PartNumber = part.PartNumber,
            Name = part.Name,
            ShortDescription = part.ShortDescription,
            Quantity = part.Quantity ?? 1,
            PartTypeId = part.PartTypeId,
            PartTypeName = part.PartTypeName,
            PartTypeCategory = part.PartTypeCategory,
            Status = part.Status,
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
            PartLevelName = part.PartLevelName
        });

        if (part.Children != null && part.Children.Any())
        {
            int childIndex = 1;
            foreach (var child in part.Children)
            {
                FlattenBomToList(child, flatList, level + 1, $"{hierarchicalNumber}.{childIndex}", part.Id);
                childIndex++;
            }
        }
    }

    [HttpGet("{partId}/bom/level/{maxLevel}")]
    public async Task<ActionResult<PartDetailReadModel>> GetBomHierarchyByLevel(Guid partId, int maxLevel)
    {
        var bom = await bomService.GetBomHierarchyByLevelAsync(partId, maxLevel);
        if (bom == null)
            return NotFound();

        return Ok(bom);
    }

    [HttpGet("{partId}/parents/full")]
    public async Task<ActionResult<List<PartDetailReadModel>>> GetFullParentHierarchy(Guid partId)
    {
        var parents = await bomService.GetFullParentHierarchyAsync(partId);
        return Ok(parents);
    }

    [HttpGet("{partId}/parents/level/{maxLevel}")]
    public async Task<ActionResult<List<PartDetailReadModel>>> GetParentHierarchyByLevel(Guid partId, int maxLevel)
    {
        var parents = await bomService.GetParentHierarchyByLevelAsync(partId, maxLevel);
        return Ok(parents);
    }

    [HttpGet("{partId}/bom/full/csv")]
    public async Task<IActionResult> GetFullBomHierarchyAsCsv(Guid partId)
    {
        var bom = await bomService.GetFullBomHierarchyAsync(partId);
        if (bom == null)
            return NotFound();

        var csvContent = GenerateBomCsv(bom);
        var bytes = Encoding.UTF8.GetBytes(csvContent);

        var fileName = $"BOM_Hierarchy_{bom.PartNumber ?? partId.ToString()}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";

        return File(bytes, "text/csv", fileName);
    }

    [HttpGet("{partId}/bom/full/excel")]
    public async Task<IActionResult> GetFullBomHierarchyAsExcel(Guid partId)
    {
        var bom = await bomService.GetFullBomHierarchyAsync(partId);
        if (bom == null)
            return NotFound();

        var excelBytes = GenerateBomExcel(bom);
        var fileName = $"BOM_Hierarchy_{bom.PartNumber ?? partId.ToString()}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";

        return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
    }

    [HttpGet("bom/{parentPartId}/flat-one-level")]
    public async Task<ActionResult<PartDetailReadModel>> GetFlatBomOneLevel(Guid parentPartId)
    {
        var bom = await bomService.GetFlatBomAsync(parentPartId);

        if (bom == null)
            return NotFound();

        return Ok(bom);
    }

    private string GenerateBomCsv(PartDetailReadModel rootPart)
    {
        var csv = new StringBuilder();

        // CSV Headers
        csv.AppendLine("Level,Number,Part Number,Part Name,Quantity,Part Type,Make/Buy,Manufacturing Part Number,Manufacturer,TRL#,Material,Space Qualified?,Country Of Origin,Assembly Location, Subsystem,Part Level");

        // Add root part
        csv.AppendLine($"0,1,\"{EscapeCsvField(rootPart.PartNumber)}\"," +
            $"\"{EscapeCsvField(rootPart.Name)}\"," +
            $"{rootPart.Quantity ?? 1}," +
            $"\"{EscapeCsvField(rootPart.PartTypeName)}\"," +
            $"{(rootPart.MakeBuy == 0 ? "Make" : "Buy")}," +
            $"\"{EscapeCsvField(rootPart.ManufacturingPartNumber)}\"," +
            $"\"{EscapeCsvField(rootPart.ManufacturerName)}\"," +
            $"{(rootPart.Trl.HasValue ? rootPart.Trl.Value.ToString() : "")}," +
            $"\"{EscapeCsvField(rootPart.Material)}\"," +
            $"{(rootPart.SpaceQualified == true ? "Yes" : "No")}," +
            $"\"{EscapeCsvField(rootPart.CountryOfOriginName)}\"," +
            $"\"{EscapeCsvField(rootPart.AssemblyLocationName)}\"," +
            $"\"{EscapeCsvField(rootPart.SubsystemName)}\"," +
            $"\"{EscapeCsvField(rootPart.PartLevelName)}\"");
        // Add children recursively
        if (rootPart.Children != null && rootPart.Children.Any())
        {
            int childIndex = 1;
            foreach (var child in rootPart.Children)
            {
                FlattenBomHierarchy(csv, child, 1, $"1.{childIndex}");
                childIndex++;
            }
        }

        return csv.ToString();
    }

    private void FlattenBomHierarchy(StringBuilder csv, PartDetailReadModel part, int level, string hierarchicalNumber)
    {
        csv.AppendLine($"{level},\"{hierarchicalNumber}\",\"{EscapeCsvField(part.PartNumber)}\"," +
            $"\"{EscapeCsvField(part.Name)}\"," +
            $"{part.Quantity ?? 1}," +
            $"\"{EscapeCsvField(part.PartTypeName)}\"," +
            $"{(part.MakeBuy == 0 ? "Make" : "Buy")}," +
            $"\"{EscapeCsvField(part.ManufacturingPartNumber)}\"," +
            $"\"{EscapeCsvField(part.ManufacturerName)}\"," +
            $"{(part.Trl.HasValue ? part.Trl.Value.ToString() : "")}," +
            $"\"{EscapeCsvField(part.Material)}\"," +
            $"{(part.SpaceQualified == true ? "Yes" : "No")}," +
            $"\"{EscapeCsvField(part.CountryOfOriginName)}\"," +
            $"\"{EscapeCsvField(part.AssemblyLocationName)}\"," +
            $"\"{EscapeCsvField(part.SubsystemName)}\"," +
            $"\"{EscapeCsvField(part.PartLevelName)}\"");

        if (part.Children != null && part.Children.Any())
        {
            int childIndex = 1;
            foreach (var child in part.Children)
            {
                FlattenBomHierarchy(csv, child, level + 1, $"{hierarchicalNumber}.{childIndex}");
                childIndex++;
            }
        }
    }

    private string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field))
            return string.Empty;

        // Escape double quotes by doubling them
        return field.Replace("\"", "\"\"");
    }

    private byte[] GenerateBomExcel(PartDetailReadModel rootPart)
    {
        using (var workbook = new XLWorkbook())
        {
            var worksheet = workbook.Worksheets.Add("BOM Hierarchy");

            // Define headers
            var headers = new[] { "Level", "Number", "Part Number", "Part Name", "Quantity", "Part Type", "Make/Buy", "Manufacturing Part Number", "Manufacturer", "TRL#", "Material", "Space Qualified?", "Country Of Origin", "Assembly Location", "Subsystem", "Part Level" };

            // Add headers with styling
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromArgb(68, 114, 196);
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            }

            // Track row number and hierarchy
            int currentRow = 2;
            var levelGroups = new Dictionary<int, List<int>>(); // Track rows by level for grouping

            // Add root part
            AddPartToExcel(worksheet, rootPart, 0, "1", currentRow, levelGroups);
            currentRow++;

            // Add children recursively
            if (rootPart.Children != null && rootPart.Children.Any())
            {
                int childIndex = 1;
                foreach (var child in rootPart.Children)
                {
                    currentRow = AddPartHierarchyToExcel(worksheet, child, 1, $"1.{childIndex}", currentRow, levelGroups);
                    childIndex++;
                }
            }

            // Apply hierarchical grouping
            ApplyHierarchicalGrouping(worksheet, levelGroups);

            // Auto-fit columns
            worksheet.Columns().AdjustToContents();

            // Freeze header row
            worksheet.SheetView.FreezeRows(1);

            using (var stream = new MemoryStream())
            {
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
        }
    }

    private void AddPartToExcel(IXLWorksheet worksheet, PartDetailReadModel part, int level, string hierarchicalNumber, int row, Dictionary<int, List<int>> levelGroups)
    {
        // Track this row for its level (for grouping)
        if (!levelGroups.ContainsKey(level))
            levelGroups[level] = new List<int>();
        levelGroups[level].Add(row);

        // Add indentation to the Number column based on level
        var indent = new string(' ', level * 2);

        worksheet.Cell(row, 1).Value = level;
        worksheet.Cell(row, 2).Value = indent + hierarchicalNumber;
        worksheet.Cell(row, 3).Value = part.PartNumber ?? string.Empty;
        worksheet.Cell(row, 4).Value = part.Name ?? string.Empty;
        worksheet.Cell(row, 5).Value = part.Quantity ?? 1;
        worksheet.Cell(row, 6).Value = part.PartTypeName ?? string.Empty;
        worksheet.Cell(row, 7).Value = part.MakeBuy == 0 ? "Make" : "Buy";
        worksheet.Cell(row, 8).Value = part.ManufacturingPartNumber ?? string.Empty;
        worksheet.Cell(row, 9).Value = part.ManufacturerName ?? string.Empty;
        worksheet.Cell(row, 10).Value = part.Trl?.ToString() ?? string.Empty;
        worksheet.Cell(row, 11).Value = part.Material ?? string.Empty;
        worksheet.Cell(row, 12).Value = part.SpaceQualified == true ? "Yes" : "No";
        worksheet.Cell(row, 13).Value = part.CountryOfOriginName ?? string.Empty;
        worksheet.Cell(row, 14).Value = part.AssemblyLocationName ?? string.Empty;
        worksheet.Cell(row, 15).Value = part.SubsystemName ?? string.Empty;
        worksheet.Cell(row, 16).Value = part.PartLevelName ?? string.Empty;

        // Apply styling based on level
        ApplyRowStyling(worksheet, row, level);
    }

    private int AddPartHierarchyToExcel(IXLWorksheet worksheet, PartDetailReadModel part, int level, string hierarchicalNumber, int currentRow, Dictionary<int, List<int>> levelGroups)
    {
        AddPartToExcel(worksheet, part, level, hierarchicalNumber, currentRow, levelGroups);
        currentRow++;

        if (part.Children != null && part.Children.Any())
        {
            int childIndex = 1;
            foreach (var child in part.Children)
            {
                currentRow = AddPartHierarchyToExcel(worksheet, child, level + 1, $"{hierarchicalNumber}.{childIndex}", currentRow, levelGroups);
                childIndex++;
            }
        }

        return currentRow;
    }

    private void ApplyRowStyling(IXLWorksheet worksheet, int row, int level)
    {
        // Apply alternating row colors for better readability
        var rowRange = worksheet.Range(row, 1, row, 16);

        if (level == 0)
        {
            // Root part - darker background
            rowRange.Style.Fill.BackgroundColor = XLColor.FromArgb(217, 225, 242);
            rowRange.Style.Font.Bold = true;
        }
        else if (row % 2 == 0)
        {
            // Even rows - light gray
            rowRange.Style.Fill.BackgroundColor = XLColor.FromArgb(242, 242, 242);
        }

        // Add borders
        rowRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        for (int col = 1; col <= 16; col++)
        {
            worksheet.Cell(row, col).Style.Border.RightBorder = XLBorderStyleValues.Thin;
        }

        // Level-based indentation visual cue - make level column slightly darker for child parts
        if (level > 0)
        {
            var levelCell = worksheet.Cell(row, 1);
            int colorValue = 255 - (level * 20);
            levelCell.Style.Fill.BackgroundColor = XLColor.FromArgb(colorValue, colorValue, colorValue);
        }
    }

    private void ApplyHierarchicalGrouping(IXLWorksheet worksheet, Dictionary<int, List<int>> levelGroups)
    {
        // Group rows by level, starting from the deepest level
        var sortedLevels = levelGroups.Keys.OrderByDescending(k => k).ToList();

        foreach (var level in sortedLevels)
        {
            if (level == 0) continue; // Don't group the root level

            var rows = levelGroups[level].OrderBy(r => r).ToList();

            // Group consecutive rows at the same level
            if (rows.Count > 0)
            {
                int groupStart = rows[0];
                int groupEnd = rows[0];

                for (int i = 1; i < rows.Count; i++)
                {
                    if (rows[i] == groupEnd + 1)
                    {
                        // Consecutive row, extend the group
                        groupEnd = rows[i];
                    }
                    else
                    {
                        // Non-consecutive, create group for previous sequence
                        if (groupEnd > groupStart)
                        {
                            worksheet.Row(groupStart).OutlineLevel = level;
                            for (int r = groupStart + 1; r <= groupEnd; r++)
                            {
                                worksheet.Row(r).OutlineLevel = level;
                            }
                        }
                        else
                        {
                            worksheet.Row(groupStart).OutlineLevel = level;
                        }

                        // Start new group
                        groupStart = rows[i];
                        groupEnd = rows[i];
                    }
                }

                // Create group for the last sequence
                if (groupEnd >= groupStart)
                {
                    for (int r = groupStart; r <= groupEnd; r++)
                    {
                        worksheet.Row(r).OutlineLevel = level;
                    }
                }
            }
        }

        // Groups are expanded by default in ClosedXML
        // You can collapse them if needed with: worksheet.CollapseRows()
    }

    [HttpGet("bom-hierarchy/{partId}/{maxBomLevel}")]
    public async Task<IActionResult> GetBomHierarchy(Guid partId, int maxBomLevel = BomDefaults.MaxBomLevel)
    {
        var records = await bomService.BuildBomHierarchy(partId, maxBomLevel);

        return Ok(records);
    }

    [HttpPost("clone/{partId}/{newPartId}")]
    public async Task<IActionResult> CloneEbom(Guid partId, Guid newPartId)
    {
        if (!partService.IsPartEditable(newPartId))
        {
            throw new ApplicationException("Part is not in Draft");
        }

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                        "call mes.clone_ebom({0}, {1}, {2})",
                        partId,
                        newPartId,
                        UserEmail
                    );

        return Ok(newPartId);
    }

    [HttpPost]
    public override async Task<IActionResult> Post(EbomWriteModel newRecord)
    {
        var existingRecord = await spaceLinxContext.Eboms.AsNoTracking()
            .FirstOrDefaultAsync(e => e.PartId == newRecord.PartId && e.ChildPartId == newRecord.ChildPartId && e.DeletedBy == null);

        if (existingRecord != null)
        {
            throw new ApplicationException("A record with the same PartId and ChildPartId already exists");
        }
        else if (!partService.IsPartEditable(newRecord.PartId))
        {
            throw new ApplicationException("Part is not in Draft");
        }
        else
        {
            var result = await base.Post(newRecord);
            await bomService.InvalidateBomCacheAsync(newRecord.PartId);
            return result;
        }
    }

    [HttpPost("create-bom")]
    public async Task<IActionResult> CreateBom(Guid PartId, List<BomCreateModel> newRecords)
    {
        if (!partService.IsPartEditable(PartId))
        {
            throw new ApplicationException("Part is not in Draft");
        }

        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            foreach(var newRecord in newRecords)
            {
                var existingRecord = await spaceLinxContext.Eboms.AsNoTracking()
                    .FirstOrDefaultAsync(e => e.PartId == PartId && e.ChildPartId == newRecord.PartId && e.DeletedBy == null);

                if (existingRecord == null)
                {
                    var recordToCreate = new EbomWriteModel
                    {
                        PartId = PartId,
                        ChildPartId = newRecord.PartId,
                        Quantity = newRecord.Quantity,
                        AssemblyLocationId = newRecord.AssemblyLocationId,
                    };

                    await base.Post(recordToCreate);
                }
                else
                {
                    continue;
                }
            }

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();
            await bomService.InvalidateBomCacheAsync(PartId);
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public override async Task<IActionResult> Update(Guid id, EbomUpdateModel updatedRecord)
    {
        var existingRecord = await GetAsync(id);

        if (existingRecord is null)
        {
            return NotFound();
        }

        if (!partService.IsPartEditable(existingRecord.PartId))
        {
            throw new ApplicationException("Part is not in Draft");
        }

        updatedRecord.Id = existingRecord.Id;

        await UpdateAsync(id, updatedRecord);
        await bomService.InvalidateBomCacheAsync(existingRecord.PartId);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public override async Task<IActionResult> Delete(Guid id)
    {
        var existingRecord = await GetAsync(id);

        if (existingRecord is null)
        {
            return NotFound();
        }

        if (!partService.IsPartEditable(existingRecord.PartId))
        {
            throw new ApplicationException("Part is not in Draft");
        }

        await RemoveAsync(id);
        await bomService.InvalidateBomCacheAsync(existingRecord.PartId);

        return NoContent();
    }

    /// <summary>
    /// Manually triggers a refresh of all BOM caches. Clears existing cache and rebuilds for all parts with BOMs.
    /// </summary>
    [HttpPost("admin/refresh-all-bom-cache")]
    public async Task<IActionResult> RefreshAllBomCache(
        [FromServices] IBomCacheRefreshService refreshService,
        CancellationToken cancellationToken)
    {
        var result = await refreshService.RefreshAllBomCachesAsync(cancellationToken);
        return Ok(result);
    }
}
