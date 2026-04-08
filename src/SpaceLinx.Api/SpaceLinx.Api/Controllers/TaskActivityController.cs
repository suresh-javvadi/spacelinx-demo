using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TaskActivityController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) : BaseController(spaceLinxContext, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all activities for a specific task
    /// </summary>
    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TaskActivityReadModel>>> GetByTaskAsync(Guid taskId, [FromQuery] int limit = 50)
    {
        var activities = await _context.TaskActivities
            .Where(a => a.TaskId == taskId)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskActivityReadModel>>(activities));
    }

    /// <summary>
    /// Get activities for all tasks in a project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<TaskActivityReadModel>>> GetByProjectAsync(Guid projectId, [FromQuery] int limit = 100)
    {
        var activities = await _context.TaskActivities
            .Where(a => a.Task!.ProjectId == projectId)
            .Include(a => a.Task)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskActivityReadModel>>(activities));
    }

    /// <summary>
    /// Get activities by the current user
    /// </summary>
    [HttpGet("my-activity")]
    public async Task<ActionResult<IEnumerable<TaskActivityReadModel>>> GetMyActivityAsync([FromQuery] int limit = 50)
    {
        var userEmail = UserEmail;

        var activities = await _context.TaskActivities
            .Where(a => a.CreatedBy == userEmail)
            .Include(a => a.Task)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskActivityReadModel>>(activities));
    }

    /// <summary>
    /// Get activities by type for a task
    /// </summary>
    [HttpGet("task/{taskId}/type/{activityType}")]
    public async Task<ActionResult<IEnumerable<TaskActivityReadModel>>> GetByTypeAsync(Guid taskId, string activityType, [FromQuery] int limit = 50)
    {
        var activities = await _context.TaskActivities
            .Where(a => a.TaskId == taskId && a.ActivityType == activityType)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskActivityReadModel>>(activities));
    }
}
