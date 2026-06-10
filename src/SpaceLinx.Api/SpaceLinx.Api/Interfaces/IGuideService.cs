using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;
namespace SpaceLinx.Api.Interfaces
{
    public interface IGuideService
    {
        Task<double> GetCalculatedWeightAsync(Guid guideId);
        Task<GuideReadModel?> GetGuideByIdAsync(Guid id);
        Task<List<object>> GetPartsHavingGuideAsync();
        Task<List<object>> GetPartsHavingPublishedGuideAsync();
        Task<List<GuideReadModel>> GetPublishedVersionsAsync(Guid partId);
        Task<List<GuideReadModel>> GetVersionsAsync(Guid partId);
        Task<List<GuideReadModel>> GetByPlatformAsync(Guid platformId);
        Task<GuideDetailReadModel> GetGuideDetailsAsync(Guid guideId);
        Task<GuideReadModel> GetGuideByPartAsync(Guid partId);
        Task<List<GuideReadModel>> GetUniqueGuidesWithLatestVersionAsync();
        Task<List<object>> GetVersionsByGuideNumberAsync(string guideNumber);
        Task<List<object>> GetVersionsByGuideIdAsync(Guid guideId);
        Task<List<GuideEbom>> GetGuideEbomByGuideIdAsync(Guid guideId);
        Task<List<GuideMbomVw>> GetGuideMbomAsync(Guid guideId);
        Task<List<GuideReadModel>> GetGuidesAsync(Guid id);
        Task ValidateGuideStatusAsync(Guid id, string error);
        Task<GuideStepReadModel?> CreateGuideFirstStepAsync(Guid guideId);
        Task GuideCheckOutAsync(Guid guideId);
        Task BulkDeleteGuideStepsAsync(List<Guid> guideStepIds);
    }
}