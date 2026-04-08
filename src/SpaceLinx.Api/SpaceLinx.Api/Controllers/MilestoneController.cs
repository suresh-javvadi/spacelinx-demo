using AutoMapper;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class MilestoneController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<Milestone, MilestoneWriteModel, MilestoneUpdateModel, MilestoneReadModel, MilestoneRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}
