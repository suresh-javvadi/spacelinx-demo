using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class TaskController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
GenericRestController<Model.Task, TaskWriteModel, TaskUpdateModel, TaskReadModel, TaskRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;
    private readonly IUserService _userService = userService;

    /// <summary>
    /// Get all tasks for a specific project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<TaskReadModel>>> GetByProjectAsync(Guid projectId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.DeletedAt == null)
            .Include(t => t.AssignedTo)
            .Include(t => t.Milestone)
            .Include(t => t.ParentTask)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskReadModel>>(tasks));
    }

    /// <summary>
    /// Get task hierarchy (tree structure) for a project
    /// </summary>
    [HttpGet("project/{projectId}/hierarchy")]
    public async Task<ActionResult<IEnumerable<TaskReadModel>>> GetHierarchyAsync(Guid projectId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.DeletedAt == null && t.ParentTaskId == null)
            .Include(t => t.AssignedTo)
            .Include(t => t.Milestone)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .Include(t => t.SubTasks.Where(st => st.DeletedAt == null))
                .ThenInclude(st => st.AssignedTo)
            .Include(t => t.SubTasks.Where(st => st.DeletedAt == null))
                .ThenInclude(st => st.Assignees.Where(a => a.DeletedAt == null))
                    .ThenInclude(a => a.User)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskReadModel>>(tasks));
    }

    /// <summary>
    /// Get subtasks for a specific task
    /// </summary>
    [HttpGet("{id}/subtasks")]
    public async Task<ActionResult<IEnumerable<TaskReadModel>>> GetSubtasksAsync(Guid id)
    {
        var subtasks = await _context.Tasks
            .Where(t => t.ParentTaskId == id && t.DeletedAt == null)
            .Include(t => t.AssignedTo)
            .Include(t => t.Milestone)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskReadModel>>(subtasks));
    }

    /// <summary>
    /// Get all tasks assigned to the current user
    /// </summary>
    [HttpGet("my-tasks")]
    public async Task<ActionResult<IEnumerable<TaskReadModel>>> GetMyTasksAsync()
    {
        var userEmail = UserEmail;

        // Get user member for current user
        var user = await _context.Users
            .FirstOrDefaultAsync(s => s.Email == userEmail && s.DeletedAt == null);

        if (user == null)
        {
            return Ok(new List<TaskReadModel>());
        }

        // Get tasks where user is assigned (either via AssignedToId or TaskAssignee)
        var tasks = await _context.Tasks
            .Where(t => t.DeletedAt == null &&
                (t.AssignedToId == user.Id ||
                 t.Assignees.Any(a => a.UserId == user.Id && a.DeletedAt == null)))
            .Include(t => t.Project)
            .Include(t => t.Milestone)
            .Include(t => t.ParentTask)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .OrderBy(t => t.DueDate)
            .ThenBy(t => t.Priority)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskReadModel>>(tasks));
    }

    /// <summary>
    /// Update only the status of a task
    /// </summary>
    [HttpPut("{id}/status")]
    public async Task<ActionResult<TaskReadModel>> UpdateStatusAsync(Guid id, [FromBody] TaskStatusUpdateModel model)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null || task.DeletedAt != null)
        {
            return NotFound();
        }

        var oldStatus = task.Status;
        task.Status = model.Status;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = UserEmail;

        // If status is Completed, set progress to 100%
        if (model.Status == "Completed")
        {
            task.ProgressPercent = 100;
        }

        // Log the activity
        var activity = new TaskActivity
        {
            TaskId = id,
            ActivityType = "StatusChanged",
            FieldChanged = "Status",
            OldValue = oldStatus,
            NewValue = model.Status,
            Description = $"Status changed from '{oldStatus}' to '{model.Status}'",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail
        };
        _context.TaskActivities.Add(activity);

        await _context.SaveChangesAsync();

        // Reload with includes
        var updatedTask = await _context.Tasks
            .Where(t => t.Id == id)
            .Include(t => t.AssignedTo)
            .Include(t => t.Project)
            .Include(t => t.Milestone)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return Ok(_mapper.Map<TaskReadModel>(updatedTask));
    }

    /// <summary>
    /// Update only the progress percentage of a task
    /// </summary>
    [HttpPut("{id}/progress")]
    public async Task<ActionResult<TaskReadModel>> UpdateProgressAsync(Guid id, [FromBody] TaskProgressUpdateModel model)
    {
        var task = await _context.Tasks.FindAsync(id);

        if (task == null || task.DeletedAt != null)
        {
            return NotFound();
        }

        var oldProgress = task.ProgressPercent;
        task.ProgressPercent = model.ProgressPercent;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = UserEmail;

        // If progress is 100%, set status to Completed
        if (model.ProgressPercent == 100 && task.Status != "Completed")
        {
            task.Status = "Completed";
        }

        // Log the activity
        var activity = new TaskActivity
        {
            TaskId = id,
            ActivityType = "ProgressChanged",
            FieldChanged = "ProgressPercent",
            OldValue = oldProgress.ToString(),
            NewValue = model.ProgressPercent.ToString(),
            Description = $"Progress updated from {oldProgress}% to {model.ProgressPercent}%",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail
        };
        _context.TaskActivities.Add(activity);

        await _context.SaveChangesAsync();

        // Reload with includes
        var updatedTask = await _context.Tasks
            .Where(t => t.Id == id)
            .Include(t => t.AssignedTo)
            .Include(t => t.Project)
            .Include(t => t.Milestone)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return Ok(_mapper.Map<TaskReadModel>(updatedTask));
    }
}

/// <summary>
/// Model for updating task status only
/// </summary>
public class TaskStatusUpdateModel
{
    public string Status { get; set; } = null!;
}

/// <summary>
/// Model for updating task progress only
/// </summary>
public class TaskProgressUpdateModel
{
    public int ProgressPercent { get; set; }
}
