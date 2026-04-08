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
public class GrnLineItemController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<GrnLineItem, GrnLineItemWriteModel, GrnLineItemUpdateModel, GrnLineItemReadModel, GrnLineItemRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}