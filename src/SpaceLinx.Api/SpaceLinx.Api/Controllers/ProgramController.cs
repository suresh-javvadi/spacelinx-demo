using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using System.Linq.Dynamic.Core;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class ProgramController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
    GenericRestController<Model.Program, ProgramWriteModel, ProgramUpdateModel, ProgramReadModel, ProgramRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("with-projects")]
    public async Task<IActionResult> GetProgramWithProjects()
    {
        var programs = await spaceLinxContext.Programs
            .AsNoTracking()
            .Include(p => p.Projects)
            .Include(p => p.Customer)
            .Include(p => p.SupplyChainManager)
            .Include(p => p.Buyer)
            .Where(p => p.IsActive && p.DeletedBy == null)
            .ToListAsync();

        var result = programs.Select(program => new
        {
            Program = mapper.Map<ProgramReadModel>(program),
            Projects = program.Projects.Select(project => new
            {
                project.Id,
                project.ProjectCode,
                project.Name,
                project.Description,
                project.StartDate,
                project.EndDate,
                project.Status,
                project.Budget,
                project.ProjectManagerId
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("projects/{id}")]
    public async Task<IActionResult> GetProjectsById(Guid id)
    {
        var program = await spaceLinxContext.Programs
        .AsNoTracking()
        .Include(p => p.Projects)
        .Include(p => p.Customer)
        .Include(p => p.SupplyChainManager)
        .Include(p => p.Buyer)
        .FirstOrDefaultAsync(p => p.Id == id && p.DeletedBy == null);

        var result = new
        {
            Program = mapper.Map<ProgramReadModel>(program),
            Projects = program.Projects.Select(project => new
            {
                project.Id,
                project.ProjectCode,
                project.Name,
                project.Description,
                project.StartDate,
                project.EndDate,
                project.Status,
                project.Budget,
                project.ProjectManagerId
            }).ToList()
        };

        return Ok(result);
    }
}