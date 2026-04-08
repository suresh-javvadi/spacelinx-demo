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
public class TenderLineItemController : GenericRestController<TenderLineItem, TenderLineItemWriteModel, TenderLineItemUpdateModel, TenderLineItemReadModel, TenderLineItemRefModel>
{
    public TenderLineItemController(
        SpaceLinxContext spaceLinxContext,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
        : base(spaceLinxContext, mapper, httpContextAccessor)
    {
    }
}
