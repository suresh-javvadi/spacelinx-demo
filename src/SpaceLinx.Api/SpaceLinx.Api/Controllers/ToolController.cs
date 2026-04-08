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
public class ToolController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<Tool, ToolWriteModel, ToolUpdateModel, ToolReadModel, ToolRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}
