using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class AssemblyLocationController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<AssemblyLocation, AssemblyLocationWriteModel, AssemblyLocationUpdateModel, AssemblyLocationReadModel, AssemblyLocationRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}