using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces
{
    public interface IEcoPartService
    {
        Task<EcoPart?> CreateEcoPart(Guid ecoEntityId, EcoPartWriteModel ecoPart);
    }
}
