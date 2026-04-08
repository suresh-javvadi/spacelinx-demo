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
public class ScrapLineItemController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<ScrapLineItem, ScrapLineItemWriteModel, ScrapLineItemUpdateModel, ScrapLineItemReadModel, ScrapLineItemRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}