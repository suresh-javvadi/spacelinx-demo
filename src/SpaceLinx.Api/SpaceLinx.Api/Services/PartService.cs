using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
 
namespace SpaceLinx.Api.Services;
 
public class PartService(SpaceLinxContext _spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor)
    : BaseService(_spaceLinxContext, _contextAccessor), IPartService
{
    public async Task<Part?> ClonePartWithNewVersion(Guid partId)
    {
        try
        {
            var record = await _spaceLinxContext.Parts.AsNoTracking().FirstOrDefaultAsync(x => x.Id == partId && x.DeletedBy == null);
            if (record == null)
            {
                throw new ApplicationException("Part Not Found.");
            }
 
            if (record.MakeBuy == 1)
            {
                throw new InvalidOperationException("Buy parts cannot be revised.");
            }
 
            int currentVersion = int.Parse(record.Version);
            string newVersion = (currentVersion + 1).ToString("D2");
 
            var newPart = new Part
            {
                Name = record.Name,
                ShortDescription = record.ShortDescription,
                Description = record.Description,
                PartNumberSuffix = record.PartNumberSuffix,
                Version = newVersion,
                PartTypeId = record.PartTypeId,
                Weight = record.Weight,
                UnitOfMeasureId = record.UnitOfMeasureId,
                MakeBuy = record.MakeBuy,
                IsSerialNumberRequired = record.IsSerialNumberRequired,
                UnitPrice = record.UnitPrice,
                ManufacturerName = record.ManufacturerName,
                Trl = record.Trl,
                SpaceQualified = record.SpaceQualified,
                ReferenceNumber = record.ReferenceNumber,
                Material = record.Material,
                CountryOfOriginId = record.CountryOfOriginId,
                Specification = record.Specification,
                Package = record.Package,
                Qualification = record.Qualification,
                RadiationTolerance = record.RadiationTolerance,
                TempRange = record.TempRange,
                TempCoefficient = record.TempCoefficient,
                CreatedBy = UserEmail,
                IsActive = true
            };
 
            await _spaceLinxContext.Parts.AddAsync(newPart);
            await _spaceLinxContext.SaveChangesAsync();
 
            var eboms = await _spaceLinxContext.Eboms.AsNoTracking()
                .Where(x => x.PartId == partId && x.DeletedBy == null)
                .ToListAsync();

            var childPartIds = eboms.Select(e => e.ChildPartId).Distinct().ToList();
            var activeChildParts = await _spaceLinxContext.Parts.AsNoTracking()
                .Where(p => p.Id.HasValue && childPartIds.Contains(p.Id.Value) && p.DeletedBy == null)
                .Select(p => p.Id.Value)
                .ToListAsync();

            eboms = eboms.Where(e => activeChildParts.Contains(e.ChildPartId)).ToList();
            foreach (var ebom in eboms)
            {
                var newEbom = new Ebom
                {
                    PartId = newPart.Id.Value,
                    ChildPartId = ebom.ChildPartId,
                    Quantity = ebom.Quantity,
                    CreatedBy = UserEmail,
                    IsActive = true
                };
 
                await _spaceLinxContext.AddAsync(newEbom);
            }
            await _spaceLinxContext.SaveChangesAsync();
 
            return newPart;
        }
        catch (Exception ex)
        {
            throw new ApplicationException(ex.Message);
        }
    }
 
    public bool IsPartEditable(Guid partId)
    {
        var record =  _spaceLinxContext.Parts.AsNoTracking().FirstOrDefault(x => x.Id == partId && x.DeletedBy == null);
        if (record == null || record.Status != "Draft")
        {
            return false;
        }
 
        return true;
    }
 
    public bool IsPartEditable(string status)
    {
        if (status != "Draft")
        {
            return false;
        }
 
        return true;
    }
}
