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
public class TenderQuotationLineItemController : GenericRestController<TenderQuotationLineItem, TenderQuotationLineItemWriteModel, TenderQuotationLineItemUpdateModel, TenderQuotationLineItemReadModel, TenderQuotationLineItemRefModel>
{
    public TenderQuotationLineItemController(
        SpaceLinxContext spaceLinxContext,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
        : base(spaceLinxContext, mapper, httpContextAccessor)
    {
    }
}
