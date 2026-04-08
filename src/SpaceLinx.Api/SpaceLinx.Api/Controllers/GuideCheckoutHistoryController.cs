using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class GuideCheckOutHistoryController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<GuideCheckOutHistory, GuideCheckOutHistoryWriteModel, GuideCheckOutHistoryUpdateModel, GuideCheckOutHistoryReadModel, GuideCheckOutHistoryRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}