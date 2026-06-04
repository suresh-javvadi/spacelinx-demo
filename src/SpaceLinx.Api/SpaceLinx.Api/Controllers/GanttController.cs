using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

/// <summary>
/// Controller for Gantt chart operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class GanttController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) : BaseController(spaceLinxContext, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get Gantt chart data for a project including tasks with dependencies
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<GanttDataModel>> GetProjectGanttDataAsync(Guid projectId)
    {
        // Get project details
        var project = await _context.Projects
            .Where(p => p.Id == projectId && p.DeletedAt == null)
            .Include(p => p.Program)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound("Project not found");
        }

        // Get all tasks for the project with dependencies
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.DeletedAt == null)
            .Include(t => t.AssignedTo)
            .Include(t => t.ParentTask)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .Include(t => t.PredecessorDependencies.Where(d => d.DeletedAt == null))
                .ThenInclude(d => d.PredecessorTask)
            .Include(t => t.SuccessorDependencies.Where(d => d.DeletedAt == null))
                .ThenInclude(d => d.SuccessorTask)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.StartDate)
            .ThenBy(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        // Get milestones for the project
        var milestones = await _context.Milestones
            .Where(m => m.ProjectId == projectId && m.DeletedAt == null)
            .OrderBy(m => m.TargetDate)
            .AsNoTracking()
            .ToListAsync();

        // Build the Gantt data model
        var ganttData = new GanttDataModel
        {
            ProjectId = project.Id!.Value,
            ProjectName = project.Name,
            ProjectStartDate = project.StartDate,
            ProjectEndDate = project.EndDate,
            Tasks = tasks.Select(t => new GanttTaskModel
            {
                Id = t.Id!.Value,
                Name = t.Name,
                TaskCode = t.TaskCode,
                StartDate = t.StartDate,
                DueDate = t.DueDate,
                Progress = t.ProgressPercent ?? 0,
                Status = t.Status,
                Priority = t.Priority,
                TaskType = t.TaskType,
                ParentTaskId = t.ParentTaskId,
                AssignedToId = t.AssignedToId,
                AssignedToName = t.AssignedTo != null ? $"{t.AssignedTo.FirstName} {t.AssignedTo.LastName}" : null,
                EstimatedHours = t.EstimatedHours,
                ActualHours = t.ActualHours,
                SortOrder = t.SortOrder ?? 0,
                Dependencies = t.PredecessorDependencies
                    .Select(d => new GanttDependencyModel
                    {
                        Id = d.Id!.Value,
                        PredecessorTaskId = d.PredecessorTaskId,
                        SuccessorTaskId = d.SuccessorTaskId,
                        DependencyType = d.DependencyType,
                        LagDays = d.LagDays ?? 0
                    }).ToList(),
                Assignees = t.Assignees
                    .Select(a => new GanttAssigneeModel
                    {
                        UserId = a.UserId,
                        UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                        Role = a.AssigneeRole
                    }).ToList()
            }).ToList(),
            Milestones = milestones.Select(m => new GanttMilestoneModel
            {
                Id = m.Id!.Value,
                Name = m.Name,
                TargetDate = m.TargetDate,
                Status = m.Status
            }).ToList()
        };

        return Ok(ganttData);
    }

    /// <summary>
    /// Update task dates (for drag-drop operations on Gantt chart)
    /// </summary>
    [HttpPut("task/{taskId}/dates")]
    public async Task<ActionResult<GanttTaskModel>> UpdateTaskDatesAsync(Guid taskId, [FromBody] GanttDateUpdateModel model)
    {
        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null || task.DeletedAt != null)
        {
            return NotFound("Task not found");
        }

        var oldStartDate = task.StartDate;
        var oldDueDate = task.DueDate;

        task.StartDate = model.StartDate;
        task.DueDate = model.DueDate;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = UserEmail;

        // Log the activity
        var activities = new List<TaskActivity>();

        if (oldStartDate != model.StartDate)
        {
            activities.Add(new TaskActivity
            {
                TaskId = taskId,
                ActivityType = "DateChanged",
                FieldChanged = "StartDate",
                OldValue = oldStartDate?.ToString("yyyy-MM-dd"),
                NewValue = model.StartDate?.ToString("yyyy-MM-dd"),
                Description = $"Start date changed from '{oldStartDate:yyyy-MM-dd}' to '{model.StartDate:yyyy-MM-dd}'",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = UserEmail
            });
        }

        if (oldDueDate != model.DueDate)
        {
            activities.Add(new TaskActivity
            {
                TaskId = taskId,
                ActivityType = "DateChanged",
                FieldChanged = "DueDate",
                OldValue = oldDueDate?.ToString("yyyy-MM-dd"),
                NewValue = model.DueDate?.ToString("yyyy-MM-dd"),
                Description = $"Due date changed from '{oldDueDate:yyyy-MM-dd}' to '{model.DueDate:yyyy-MM-dd}'",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = UserEmail
            });
        }

        if (activities.Any())
        {
            _context.TaskActivities.AddRange(activities);
        }

        await _context.SaveChangesAsync();

        // Reload with includes
        var updatedTask = await _context.Tasks
            .Where(t => t.Id == taskId)
            .Include(t => t.AssignedTo)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .Include(t => t.PredecessorDependencies.Where(d => d.DeletedAt == null))
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return Ok(MapToGanttTaskModel(updatedTask!));
    }

    /// <summary>
    /// Update task progress (for progress bar drag on Gantt chart)
    /// </summary>
    [HttpPut("task/{taskId}/progress")]
    public async Task<ActionResult<GanttTaskModel>> UpdateTaskProgressAsync(Guid taskId, [FromBody] GanttProgressUpdateModel model)
    {
        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null || task.DeletedAt != null)
        {
            return NotFound("Task not found");
        }

        var oldProgress = task.ProgressPercent;
        task.ProgressPercent = model.Progress;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = UserEmail;

        // If progress is 100%, optionally set status to Completed
        if (model.Progress == 100 && task.Status != "Completed")
        {
            task.Status = "Completed";
        }

        // Log the activity
        var activity = new TaskActivity
        {
            TaskId = taskId,
            ActivityType = "ProgressChanged",
            FieldChanged = "ProgressPercent",
            OldValue = oldProgress.ToString(),
            NewValue = model.Progress.ToString(),
            Description = $"Progress updated from {oldProgress}% to {model.Progress}%",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail
        };
        _context.TaskActivities.Add(activity);

        await _context.SaveChangesAsync();

        // Reload with includes
        var updatedTask = await _context.Tasks
            .Where(t => t.Id == taskId)
            .Include(t => t.AssignedTo)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .Include(t => t.PredecessorDependencies.Where(d => d.DeletedAt == null))
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return Ok(MapToGanttTaskModel(updatedTask!));
    }

    /// <summary>
    /// Update task sort order (for reordering in Gantt chart)
    /// </summary>
    [HttpPut("task/{taskId}/order")]
    public async Task<ActionResult> UpdateTaskOrderAsync(Guid taskId, [FromBody] GanttOrderUpdateModel model)
    {
        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null || task.DeletedAt != null)
        {
            return NotFound("Task not found");
        }

        task.SortOrder = model.SortOrder;
        task.ParentTaskId = model.ParentTaskId;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = UserEmail;

        await _context.SaveChangesAsync();

        return Ok();
    }

    private static GanttTaskModel MapToGanttTaskModel(Model.Task task)
    {
        return new GanttTaskModel
        {
            Id = task.Id!.Value,
            Name = task.Name,
            TaskCode = task.TaskCode,
            StartDate = task.StartDate,
            DueDate = task.DueDate,
            Progress = task.ProgressPercent ?? 0,
            Status = task.Status,
            Priority = task.Priority,
            TaskType = task.TaskType,
            ParentTaskId = task.ParentTaskId,
            AssignedToId = task.AssignedToId,
            AssignedToName = task.AssignedTo != null ? $"{task.AssignedTo.FirstName} {task.AssignedTo.LastName}" : null,
            EstimatedHours = task.EstimatedHours,
            ActualHours = task.ActualHours,
            SortOrder = task.SortOrder ?? 0,
            Dependencies = task.PredecessorDependencies?
                .Select(d => new GanttDependencyModel
                {
                    Id = d.Id!.Value,
                    PredecessorTaskId = d.PredecessorTaskId,
                    SuccessorTaskId = d.SuccessorTaskId,
                    DependencyType = d.DependencyType,
                    LagDays = d.LagDays ?? 0
                }).ToList() ?? new List<GanttDependencyModel>(),
            Assignees = task.Assignees?
                .Select(a => new GanttAssigneeModel
                {
                    UserId = a.UserId,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                    Role = a.AssigneeRole
                }).ToList() ?? new List<GanttAssigneeModel>()
        };
    }
}

#region Gantt Models

/// <summary>
/// Complete Gantt chart data for a project
/// </summary>
public class GanttDataModel
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public DateTime? ProjectStartDate { get; set; }
    public DateTime? ProjectEndDate { get; set; }
    public List<GanttTaskModel> Tasks { get; set; } = new();
    public List<GanttMilestoneModel> Milestones { get; set; } = new();
}

/// <summary>
/// Task model optimized for Gantt chart rendering
/// </summary>
public class GanttTaskModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? TaskCode { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
    public int Progress { get; set; }
    public string Status { get; set; } = null!;
    public string Priority { get; set; } = null!;
    public string TaskType { get; set; } = "Task";
    public Guid? ParentTaskId { get; set; }
    public Guid? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    public int SortOrder { get; set; }
    public List<GanttDependencyModel> Dependencies { get; set; } = new();
    public List<GanttAssigneeModel> Assignees { get; set; } = new();
}

/// <summary>
/// Dependency model for Gantt chart
/// </summary>
public class GanttDependencyModel
{
    public Guid Id { get; set; }
    public Guid PredecessorTaskId { get; set; }
    public Guid SuccessorTaskId { get; set; }
    public string DependencyType { get; set; } = "FinishToStart";
    public int LagDays { get; set; }
}

/// <summary>
/// Assignee model for Gantt chart
/// </summary>
public class GanttAssigneeModel
{
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? Role { get; set; }
}

/// <summary>
/// Milestone model for Gantt chart
/// </summary>
public class GanttMilestoneModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime? TargetDate { get; set; }
    public string? Status { get; set; }
}

/// <summary>
/// Model for updating task dates via Gantt drag-drop
/// </summary>
public class GanttDateUpdateModel
{
    public DateTime? StartDate { get; set; }
    public DateTime? DueDate { get; set; }
}

/// <summary>
/// Model for updating task progress via Gantt
/// </summary>
public class GanttProgressUpdateModel
{
    public int Progress { get; set; }
}

/// <summary>
/// Model for updating task order in Gantt
/// </summary>
public class GanttOrderUpdateModel
{
    public int SortOrder { get; set; }
    public Guid? ParentTaskId { get; set; }
}

#endregion
