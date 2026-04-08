using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class TaskDependencyController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
GenericRestController<TaskDependency, TaskDependencyWriteModel, TaskDependencyUpdateModel, TaskDependencyReadModel, TaskDependencyRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all dependencies for a specific task (both predecessors and successors)
    /// </summary>
    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<object>> GetByTaskAsync(Guid taskId)
    {
        var predecessors = await _context.TaskDependencies
            .Where(d => d.SuccessorTaskId == taskId && d.DeletedAt == null)
            .Include(d => d.PredecessorTask)
            .AsNoTracking()
            .ToListAsync();

        var successors = await _context.TaskDependencies
            .Where(d => d.PredecessorTaskId == taskId && d.DeletedAt == null)
            .Include(d => d.SuccessorTask)
            .AsNoTracking()
            .ToListAsync();

        return Ok(new
        {
            Predecessors = _mapper.Map<IEnumerable<TaskDependencyReadModel>>(predecessors),
            Successors = _mapper.Map<IEnumerable<TaskDependencyReadModel>>(successors)
        });
    }

    /// <summary>
    /// Get all dependencies for tasks in a project (for Gantt chart)
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<TaskDependencyReadModel>>> GetByProjectAsync(Guid projectId)
    {
        var dependencies = await _context.TaskDependencies
            .Where(d => d.DeletedAt == null &&
                (d.PredecessorTask!.ProjectId == projectId || d.SuccessorTask!.ProjectId == projectId))
            .Include(d => d.PredecessorTask)
            .Include(d => d.SuccessorTask)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskDependencyReadModel>>(dependencies));
    }
}
