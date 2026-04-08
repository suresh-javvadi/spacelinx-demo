using AutoMapper;
using Newtonsoft.Json.Linq;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class WorkOrderTaskService(SpaceLinxContext _spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor, IImageService imageService)
    : BaseService(_spaceLinxContext, _contextAccessor), IWorkOrderTaskService
{
    public async Task ImageRemoveFromResponse(string response)
    {
        var jsonObject = JObject.Parse(response);

        var imageId = (Guid)jsonObject["picture"]["response"]["imageId"];

        var imageRecord = await _spaceLinxContext.Images.FindAsync(imageId);

        await imageService.RemoveImageAsync(imageRecord);

        await _spaceLinxContext.SaveChangesAsync();
    }
}
