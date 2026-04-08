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
public class PartTypeCategoryController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<PartTypeCategory, PartTypeCategoryWriteModel, PartTypeCategoryUpdateModel, PartTypeCategoryReadModel, PartTypeCategoryRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
}