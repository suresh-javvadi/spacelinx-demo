using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class GuideService(SpaceLinxContext _spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor) 
    : BaseService(_spaceLinxContext, _contextAccessor), IGuideService
{
    public async Task<double> GetCalculatedWeightAsync(Guid guideId)
    {
        var equipmentRecords = await _spaceLinxContext.GuideStepEquipments
            .AsNoTracking()
            .Where(x => x.GuideId == guideId && x.DeletedBy == null)
            .ToListAsync();

        var partIds = equipmentRecords.Select(x => x.PartId).Distinct().ToList();

        var parts = await _spaceLinxContext.Parts
            .AsNoTracking()
            .Where(p => partIds.Contains(p.Id) && p.ItemType == null && p.DeletedBy == null)
            .ToListAsync();

        var totalWeight = (from part in parts
                           join equipment in equipmentRecords on part.Id equals equipment.PartId
                           select part.Weight * equipment.Quantity).Sum();

        return totalWeight;
    }

    public async Task<GuideReadModel?> GetGuideByIdAsync(Guid id)
    {
        var record = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Include(g => g.Part)
            .Include(g => g.GuideType)
            .Include(g => g.Platform)
            .SingleOrDefaultAsync(x => x.Id == id && x.Part.ItemType == null && x.DeletedBy == null);

        if (record == null)
        {
            return null;
        }

        return mapper.Map<GuideReadModel>(record);
    }

    public async Task<List<object>> GetPartsHavingGuideAsync()
    {
        var guides = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Include(x => x.Part)
            .Include(x => x.Platform)
            .Where(x => x.Part.ItemType == null && x.DeletedBy == null) 
            .Select(x => new
            {
                x.PartId,
                PartName = x.Part.Name,
                PartNumber = x.Part.PartNumber,
                PartNumberSuffix = x.Part.PartNumberSuffix,
                x.Name,
                x.Number,
                x.Id
            })
            .GroupBy(x => new { x.PartId, x.Number })
            .Select(g => g.FirstOrDefault())
            .ToListAsync();

        return guides.Cast<object>().ToList();
    }

    public async Task<List<object>> GetPartsHavingPublishedGuideAsync()
    {
        var guides = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Include(x => x.Part)
            .Include(x => x.Platform)
            .Where(g => g.Status == "Published" && g.Part.Status == "Release" && g.Part.ItemType == null && g.DeletedBy == null)
            .Select(x => new {
                    x.PartId,
                    PartName = x.Part.Name,
                    PartNumber = x.Part.PartNumber,
                    x.Name,
                    x.Number,
                    x.Status,
                    PlatformName = x.Platform.Name
            })
            .GroupBy(x => new { x.PartId, x.Number })
            .Select(g => g.FirstOrDefault())
            .ToListAsync();

        return guides.Cast<object>().ToList();
    }

    public async Task<List<GuideReadModel>> GetPublishedVersionsAsync(Guid partId)
    {
        var guides = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Include(g => g.Part)
            .Where(x => x.PartId == partId && x.Status == "Published" && x.Part.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<Guide>, List<GuideReadModel>>(guides);
    }

    public async Task<List<GuideReadModel>> GetVersionsAsync(Guid partId)
    {
        var guides = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Include(g => g.Part)
            .Where(x => x.PartId == partId && x.Part.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<Guide>, List<GuideReadModel>>(guides);
    }

    public async Task<List<GuideReadModel>> GetByPlatformAsync(Guid platformId)
    {
        var guide = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Include(g => g.GuideType)
            .Include(g => g.Part)
            .Include(g => g.Platform)
            .Where(x => x.PlatformId == platformId && x.Part.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<Guide>, List<GuideReadModel>>(guide);
    }

    public async Task<GuideDetailReadModel> GetGuideDetailsAsync(Guid guideId)
    {
        var guide = await _spaceLinxContext.Guides
        .AsNoTracking()
        .SingleAsync(x => x.Id == guideId && x.DeletedBy == null);

        var part = await _spaceLinxContext.Parts
                    .AsNoTracking()
                    .SingleOrDefaultAsync(p => p.Id == guide.PartId && p.ItemType == null && p.DeletedBy == null);

        var guideStepTasks = await _spaceLinxContext.GuideStepTasks
                    .AsNoTracking()
                    .Where(gst => gst.GuideId == guideId && gst.DeletedBy == null)
                    .ToListAsync();

        var guideSteps = await _spaceLinxContext.GuideSteps
                        .AsNoTracking()
                        .Where(gs => gs.GuideId == guideId && gs.DeletedBy == null)
                        .Include(gs => gs.Image)
                        .ToListAsync();

        var guideStepEquipments = await _spaceLinxContext.GuideStepEquipments
                        .AsNoTracking()
                        .Where(gse => gse.GuideId == guideId && gse.DeletedBy == null)
                        .Include(gse => gse.Part)
                            .ThenInclude(p => p.PartType)
                        .Include(gse => gse.Tool)
                            .ThenInclude(t => t.ToolType)
                        .Include(gse => gse.Machine)
                            .ThenInclude(m => m.MachineType)
                        .ToListAsync();

        var guideDetail = new GuideDetailReadModel
        {
            Name = guide.Name,
            Number = guide.Number,
            PlatformId = guide.PlatformId,
            PartId = guide.PartId,
            GuideTypeId = guide.GuideTypeId,
            Version = guide.Version,
            Status = guide.Status,
            CheckOutBy = guide.CheckOutBy,
            CloneFromId = guide.CloneFromId,
            CloneFrom = guide.CloneFrom,
            CalculatedWeight = guide.CalculatedWeight,
            GuideStepEquipments = mapper.Map<List<GuideStepEquipmentReadModel>>(guideStepEquipments),
            GuideStepTasks = mapper.Map<List<GuideStepTaskReadModel>>(guideStepTasks),
            GuideSteps = mapper.Map<List<GuideStepReadModel>>(guideSteps),
            InverseCloneFrom = guide.InverseCloneFrom,
            GuideType = mapper.Map<GuideTypeRefModel>(guide.GuideType),
            Part = mapper.Map<PartRefModel>(part),
            Platform = guide.Platform != null ? mapper.Map<PlatformRefModel>(guide.Platform) : null
        };

        return guideDetail;
    }

    public async Task<GuideReadModel> GetGuideByPartAsync(Guid partId)
    {
        var guide = await _spaceLinxContext.Guides
                .AsNoTracking()
                .Include(x => x.Part)
                .OrderByDescending(x => x.Version)
                .FirstOrDefaultAsync(x => x.PartId == partId && x.Part.ItemType == null && x.DeletedBy == null);

        if (guide == null)
        {
            throw new ApplicationException("Guide does not exist");
        }

        return mapper.Map<GuideReadModel>(guide);
    }

    public async Task<List<GuideReadModel>> GetUniqueGuidesWithLatestVersionAsync()
    {
        var guides = await _spaceLinxContext.Guides
                .AsNoTracking()
                .Include(g => g.Part)
                .Include(g => g.GuideType)
                .Include(g => g.Platform)
                .Where(g => g.Part.ItemType == null && g.DeletedBy == null)
                .GroupBy(g => g.Number)
                .Select(g => g.OrderByDescending(x => x.Version).FirstOrDefault())
                .ToListAsync();

        return mapper.Map<List<GuideReadModel>>(guides);
    }

    public async Task<List<object>> GetVersionsByGuideNumberAsync(string guideNumber)
    {
        var guides = await _spaceLinxContext.Guides
                        .AsNoTracking()
                        .Where(g => g.Number == guideNumber && g.DeletedBy == null)
                        .Select(g => new { g.Id, g.Version, g.Status })
                        .ToListAsync();

        return guides.Cast<object>().ToList();
    }

    public async Task<List<object>> GetVersionsByGuideIdAsync(Guid guideId)
    {
        var guide = await _spaceLinxContext.Guides.AsNoTracking().SingleAsync(g => g.Id == guideId && g.DeletedBy == null);
        if (guide == null)
        {
            return null;
        }

        var guides = await _spaceLinxContext.Guides
                            .AsNoTracking()
                            .Where(g => g.Number == guide.Number && g.DeletedBy == null)
                            .Select(g => new { g.Number, g.Version, g.Status })
                            .ToListAsync();

        return guides.Cast<object>().ToList();
    }

    public async Task<List<GuideEbom>> GetGuideEbomByGuideIdAsync(Guid guideId)
    {
        var guideEbom = await _spaceLinxContext.GuideEboms
                    .AsNoTracking()
                    .Where(g => g.GuideId == guideId && g.DeletedBy == null)
                    .ToListAsync();

        return guideEbom;
    }

    public async Task<List<GuideMbomVw>> GetGuideMbomAsync(Guid guideId)
    {
        var guideMbom = await _spaceLinxContext.GuideMbomVws
                .AsNoTracking()
                .Where(g => g.GuideId == guideId)
                .ToListAsync();

        return guideMbom;
    }

    public async Task<List<GuideReadModel>> GetGuidesAsync(Guid id)
    {
        var records = await _spaceLinxContext.Guides
            .AsNoTracking()
            .Where(x => x.Id == id && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<Guide>, List<GuideReadModel>>(records);
    }

    public async Task ValidateGuideStatusAsync(Guid id, string error)
    {
        var record = await _spaceLinxContext.Guides.AsNoTracking().SingleAsync(x => x.Id == id && x.DeletedBy == null);
        if (record == null)
        {
            throw new ApplicationException("Guide not found.");
        }
        else if (record.Status == "Published")
        {
            throw new ApplicationException(error);
        }
        else if (record.CheckOutBy != null && record.CheckOutBy != UserEmail)
        {
            throw new ApplicationException("Guide checked-out by a different user");
        }
    }

    public async Task<GuideStepReadModel?> CreateGuideFirstStepAsync(Guid guideId)
    {
        GuideStep newRecord = new GuideStep();
        newRecord.GuideId = guideId;
        newRecord.Title = "No Title";
        newRecord.Sequence = 1;
        newRecord.CreatedBy = UserEmail;

        _spaceLinxContext.GuideSteps.Add(newRecord);
        await _spaceLinxContext.SaveChangesAsync();

        return mapper.Map<GuideStepReadModel>(newRecord);
    }

    public async Task GuideCheckOutAsync(Guid guideId)
    {
        using var transaction = await _spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var record = await _spaceLinxContext.Guides.FirstOrDefaultAsync(g => g.Id == guideId && g.DeletedBy == null);
            if (record == null)
            {
                throw new ApplicationException("Guide not found");
            }

            if (record.CheckOutBy != null && record.CheckOutBy != UserEmail)
            {
                throw new ApplicationException("Guide checked-out by a different user");
            }

            record.CheckOutBy = UserEmail;
            record.UpdatedAt = DateTime.UtcNow;
            record.UpdatedBy = UserEmail;

            var newCheckOutRecord = new GuideCheckOutHistoryWriteModel()
            {
                GuideId = record.Id.Value,
                IsCheckedOut = true
            };

            var checkOutRecord = mapper.Map<GuideCheckOutHistory>(newCheckOutRecord);
            checkOutRecord.CreatedBy = UserEmail;
            checkOutRecord.IsActive = true;
            await _spaceLinxContext.GuideCheckOutHistories.AddAsync(checkOutRecord);
            await _spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new ApplicationException($"Internal server error: {ex.Message}");
        }
    }
}