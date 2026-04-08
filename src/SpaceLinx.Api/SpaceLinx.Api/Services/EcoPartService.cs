using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services
{
    public class EcoPartService(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor, IPartService partService)
    : BaseService(spaceLinxContext, _contextAccessor), IEcoPartService
    {
        public async Task<EcoPart?> CreateEcoPart(Guid ecoEntityId, EcoPartWriteModel ecoPart)
        {
            int count = await spaceLinxContext.EcoParts.AsNoTracking().CountAsync(x => x.EcoId == ecoEntityId && x.PartId == ecoPart.PartId && x.DeletedBy == null);

            if (count > 0)
            {
                throw new ApplicationException($"Eco Part with {ecoPart.PartId} already exists.");
            }

            var partEntity = await spaceLinxContext.Parts.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == ecoPart.PartId && x.DeletedBy == null);

            if (partEntity == null)
            {
                throw new ApplicationException($"Part with ID {ecoPart.PartId} does not exist.");
            }

            if (partEntity.Status != PartStatus.Draft && partEntity.Status != PartStatus.Release)
            {
                return null;
            }

            var currentParts = await spaceLinxContext.Parts.AsNoTracking()
                        .Where(x => x.PartNumberSuffix == partEntity.PartNumberSuffix && x.DeletedBy == null).ToListAsync();

            var previousVersionPart = currentParts.Count > 1
                                    ? currentParts
                                        .Where(x => x.PartNumberSuffix == partEntity.PartNumberSuffix && x.Id != partEntity.Id)
                                        .OrderByDescending(x => x.Version)
                                        .FirstOrDefault()
                                    : currentParts.FirstOrDefault();


            var ecoPartEntity = mapper.Map<EcoPart>(ecoPart);

            ecoPartEntity.IsActive = true;
            ecoPartEntity.CreatedBy = UserEmail;
            ecoPartEntity.CreatedAt = DateTime.UtcNow;
            ecoPartEntity.PreviousStatus = previousVersionPart.Status;
            ecoPartEntity.OldVersion = previousVersionPart.Version.ToString();
            ecoPartEntity.NewVersion = partEntity.Version.ToString();
            ecoPartEntity.EcoId = ecoEntityId;
            ecoPartEntity.PartId = partEntity.Id.Value;

            /*if (ecoPartEntity.Status == EcoPartStatus.Release && partEntity.Status == PartStatus.Release)
            {
                var newPart = await partService.ClonePartWithNewVersion(ecoPart.PartId);
                ecoPartEntity.PartId = newPart.Id.Value;
            }*/

            spaceLinxContext.EcoParts.Add(ecoPartEntity);
            await spaceLinxContext.SaveChangesAsync();
            return ecoPartEntity;
        }
    }
}
