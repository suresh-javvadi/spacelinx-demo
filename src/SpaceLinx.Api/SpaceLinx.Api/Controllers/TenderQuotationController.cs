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
public class TenderQuotationController : GenericRestController<TenderQuotation, TenderQuotationWriteModel, TenderQuotationUpdateModel, TenderQuotationReadModel, TenderQuotationRefModel>
{
    public TenderQuotationController(
        SpaceLinxContext spaceLinxContext,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
        : base(spaceLinxContext, mapper, httpContextAccessor)
    {
    }
}
