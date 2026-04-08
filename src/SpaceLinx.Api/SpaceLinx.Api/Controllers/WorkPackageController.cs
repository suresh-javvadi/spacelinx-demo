using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using NpgsqlTypes;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using System.Data;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class WorkPackageController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
    GenericRestController<WorkPackage, WorkPackageWriteModel, WorkPackageUpdateModel, WorkPackageReadModel, WorkPackageRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet]
    public override async Task<List<WorkPackageReadModel>> Get()
    {
        var records = await spaceLinxContext.WorkPackages.AsNoTracking()
            .Include(x => x.Part)
            .Include(x => x.Guide)
            .Include(x => x.Technician)
            .Include(x => x.Manager)
            .Include(x => x.Product)
            .Where(x => x.Part.ItemType == null && x.DeletedBy == null)
            .ToListAsync();

        return mapper.Map<List<WorkPackage>, List<WorkPackageReadModel>>(records);
    }

    [HttpGet("{id}")]
    public override async Task<ActionResult<WorkPackageReadModel>> Get(Guid id)
    {
        var record = await spaceLinxContext.WorkPackages
            .AsNoTracking()
            .Include(x => x.Part)
            .SingleOrDefaultAsync(x => x.Id == id && x.Part.ItemType == null && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        var result = mapper.Map<WorkPackageReadModel>(record);
        return Ok(result);
    }

    [HttpPost]
    public override async Task<IActionResult> Post(WorkPackageWriteModel newWorkPackage)
    {
        var newWorkPackageIdParameter = new NpgsqlParameter("new_Work_Package_id", NpgsqlDbType.Uuid)
        {
            Direction = ParameterDirection.Output
        };

        await spaceLinxContext.Database.ExecuteSqlRawAsync(
                 "CALL mes.create_work_package_and_work_orders({0}, {1}, {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, null)",
                 newWorkPackage.Name,
                 newWorkPackage.PartId,
                 newWorkPackage.GuideId,
                 newWorkPackage.ProductId,
                 newWorkPackage.TechnicianId,
                 newWorkPackage.ManagerId,
                 newWorkPackage.StartDate,
                 newWorkPackage.EndDate,
                 newWorkPackage.Quantity,
                 UserEmail,
                 newWorkPackageIdParameter
             );

        return Ok((Guid)newWorkPackageIdParameter.Value);
    }
}