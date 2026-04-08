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
public class TenderVendorController : GenericRestController<TenderVendor, TenderVendorWriteModel, TenderVendorUpdateModel, TenderVendorReadModel, TenderVendorRefModel>
{
    public TenderVendorController(
        SpaceLinxContext spaceLinxContext,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
        : base(spaceLinxContext, mapper, httpContextAccessor)
    {
    }
}
