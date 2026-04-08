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
public class MachineTypeController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<MachineType, MachineTypeWriteModel, MachineTypeUpdateModel, MachineTypeReadModel, MachineTypeRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}
