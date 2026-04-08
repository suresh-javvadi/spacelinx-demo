using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

/// <summary>
/// Controller for Kanban board operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class KanbanController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) : BaseController(spaceLinxContext, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get Kanban board data for a project including columns and tasks
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<KanbanBoardModel>> GetProjectKanbanDataAsync(Guid projectId)
    {
        // Get project details
        var project = await _context.Projects
            .Where(p => p.Id == projectId && p.DeletedAt == null)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound("Project not found");
        }

        // Get board columns for the project
        var columns = await _context.BoardColumns
            .Where(c => c.ProjectId == projectId && c.DeletedAt == null)
            .OrderBy(c => c.Position)
            .AsNoTracking()
            .ToListAsync();

        // If no columns exist, create default ones
        if (!columns.Any())
        {
            columns = await CreateDefaultColumnsAsync(projectId);
        }

        // Get all tasks for the project
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.DeletedAt == null)
            .Include(t => t.AssignedTo)
            .Include(t => t.Assignees.Where(a => a.DeletedAt == null))
                .ThenInclude(a => a.User)
            .Include(t => t.BoardColumn)
            .OrderBy(t => t.SortOrder)
            .ThenBy(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        // Build the Kanban board model
        var kanbanBoard = new KanbanBoardModel
        {
            ProjectId = project.Id!.Value,
            ProjectName = project.Name,
            Columns = columns.Select(c => new KanbanColumnModel
            {
                Id = c.Id!.Value,
                Name = c.Name,
                Position = c.Position,
                Color = c.Color,
                WipLimit = c.WipLimit,
                MapsToStatus = c.MapsToStatus,
                IsDefault = c.IsDefault,
                Tasks = tasks
                    .Where(t => t.BoardColumnId == c.Id ||
                           (t.BoardColumnId == null && c.MapsToStatus == t.Status))
                    .Select(t => MapToKanbanTaskModel(t))
                    .ToList()
            }).ToList()
        };

        // Handle tasks without a column assignment (put them in the matching status column or first column)
        var unassignedTasks = tasks
            .Where(t => t.BoardColumnId == null &&
                   !columns.Any(c => c.MapsToStatus == t.Status))
            .ToList();

        if (unassignedTasks.Any() && kanbanBoard.Columns.Any())
        {
            var firstColumn = kanbanBoard.Columns.First();
            firstColumn.Tasks.AddRange(unassignedTasks.Select(t => MapToKanbanTaskModel(t)));
        }

        return Ok(kanbanBoard);
    }

    /// <summary>
    /// Move a task to a different column (and optionally update its position)
    /// </summary>
    [HttpPut("task/{taskId}/move")]
    public async Task<ActionResult<KanbanTaskModel>> MoveTaskAsync(Guid taskId, [FromBody] KanbanMoveModel model)
    {
        var task = await _context.Tasks.FindAsync(taskId);

        if (task == null || task.DeletedAt != null)
        {
            return NotFound("Task not found");
        }

        var oldColumnId = task.BoardColumnId;
        var oldStatus = task.Status;

        // Update task column and position
        task.BoardColumnId = model.ColumnId;
        task.SortOrder = model.SortOrder;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = UserEmail;

        // If the target column has a mapped status, update the task status
        if (model.ColumnId.HasValue)
        {
            var targetColumn = await _context.BoardColumns.FindAsync(model.ColumnId.Value);
            if (targetColumn != null && !string.IsNullOrEmpty(targetColumn.MapsToStatus))
            {
                task.Status = targetColumn.MapsToStatus;
            }
        }

        // Log the activity
        var activities = new List<TaskActivity>();

        if (oldColumnId != model.ColumnId)
        {
            activities.Add(new TaskActivity
            {
                TaskId = taskId,
                ActivityType = "Moved",
                FieldChanged = "BoardColumnId",
                OldValue = oldColumnId?.ToString(),
                NewValue = model.ColumnId?.ToString(),
                Description = "Task moved to a different column",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = UserEmail
            });
        }

        if (oldStatus != task.Status)
        {
            activities.Add(new TaskActivity
            {
                TaskId = taskId,
                ActivityType = "StatusChanged",
                FieldChanged = "Status",
                OldValue = oldStatus,
                NewValue = task.Status,
                Description = $"Status changed from '{oldStatus}' to '{task.Status}'",
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
            .Include(t => t.BoardColumn)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return Ok(MapToKanbanTaskModel(updatedTask!));
    }

    /// <summary>
    /// Reorder tasks within a column
    /// </summary>
    [HttpPut("column/{columnId}/reorder")]
    public async Task<ActionResult> ReorderTasksAsync(Guid columnId, [FromBody] KanbanReorderModel model)
    {
        var column = await _context.BoardColumns.FindAsync(columnId);

        if (column == null || column.DeletedAt != null)
        {
            return NotFound("Column not found");
        }

        // Update sort order for each task
        foreach (var item in model.TaskOrders)
        {
            var task = await _context.Tasks.FindAsync(item.TaskId);
            if (task != null && task.DeletedAt == null)
            {
                task.SortOrder = item.SortOrder;
                task.UpdatedAt = DateTime.UtcNow;
                task.UpdatedBy = UserEmail;
            }
        }

        await _context.SaveChangesAsync();

        return Ok();
    }

    /// <summary>
    /// Get task counts per column (for quick stats)
    /// </summary>
    [HttpGet("project/{projectId}/stats")]
    public async Task<ActionResult<IEnumerable<KanbanColumnStatsModel>>> GetColumnStatsAsync(Guid projectId)
    {
        var columns = await _context.BoardColumns
            .Where(c => c.ProjectId == projectId && c.DeletedAt == null)
            .OrderBy(c => c.Position)
            .AsNoTracking()
            .ToListAsync();

        var taskCounts = await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.DeletedAt == null)
            .GroupBy(t => t.BoardColumnId)
            .Select(g => new { ColumnId = g.Key, Count = g.Count() })
            .ToListAsync();

        var stats = columns.Select(c => new KanbanColumnStatsModel
        {
            ColumnId = c.Id!.Value,
            ColumnName = c.Name,
            TaskCount = taskCounts.FirstOrDefault(tc => tc.ColumnId == c.Id)?.Count ?? 0,
            WipLimit = c.WipLimit,
            IsOverWipLimit = c.WipLimit.HasValue &&
                            (taskCounts.FirstOrDefault(tc => tc.ColumnId == c.Id)?.Count ?? 0) > c.WipLimit.Value
        }).ToList();

        return Ok(stats);
    }

    private async Task<List<BoardColumn>> CreateDefaultColumnsAsync(Guid projectId)
    {
        var defaultColumns = new List<BoardColumn>
        {
            new() { ProjectId = projectId, Name = "To Do", Position = 0, Color = "#e0e0e0", MapsToStatus = "To Do", IsDefault = true, CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { ProjectId = projectId, Name = "In Progress", Position = 1, Color = "#2196f3", MapsToStatus = "In Progress", CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { ProjectId = projectId, Name = "Review", Position = 2, Color = "#ff9800", MapsToStatus = "Review", CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { ProjectId = projectId, Name = "Done", Position = 3, Color = "#4caf50", MapsToStatus = "Completed", CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow }
        };

        _context.BoardColumns.AddRange(defaultColumns);
        await _context.SaveChangesAsync();

        return defaultColumns;
    }

    private static KanbanTaskModel MapToKanbanTaskModel(Model.Task task)
    {
        return new KanbanTaskModel
        {
            Id = task.Id!.Value,
            Name = task.Name,
            TaskCode = task.TaskCode,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            Progress = task.ProgressPercent,
            BoardColumnId = task.BoardColumnId,
            SortOrder = task.SortOrder,
            AssignedToId = task.AssignedToId,
            AssignedToName = task.AssignedTo != null ? $"{task.AssignedTo.FirstName} {task.AssignedTo.LastName}" : null,
            AssignedToImageUrl = task.AssignedTo?.ImageUrl,
            Assignees = task.Assignees?
                .Select(a => new KanbanAssigneeModel
                {
                    UserId = a.UserId,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : null,
                    ImageUrl = a.User?.ImageUrl
                }).ToList() ?? new List<KanbanAssigneeModel>()
        };
    }
}

#region Kanban Models

/// <summary>
/// Complete Kanban board data for a project
/// </summary>
public class KanbanBoardModel
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public List<KanbanColumnModel> Columns { get; set; } = new();
}

/// <summary>
/// Kanban column with its tasks
/// </summary>
public class KanbanColumnModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public int Position { get; set; }
    public string Color { get; set; } = "#1976d2";
    public int? WipLimit { get; set; }
    public string? MapsToStatus { get; set; }
    public bool IsDefault { get; set; }
    public List<KanbanTaskModel> Tasks { get; set; } = new();
}

/// <summary>
/// Task model optimized for Kanban card rendering
/// </summary>
public class KanbanTaskModel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? TaskCode { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = null!;
    public string Priority { get; set; } = null!;
    public DateTime? DueDate { get; set; }
    public int Progress { get; set; }
    public Guid? BoardColumnId { get; set; }
    public int SortOrder { get; set; }
    public Guid? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public string? AssignedToImageUrl { get; set; }
    public List<KanbanAssigneeModel> Assignees { get; set; } = new();
}

/// <summary>
/// Assignee model for Kanban cards
/// </summary>
public class KanbanAssigneeModel
{
    public Guid UserId { get; set; }
    public string? UserName { get; set; }
    public string? ImageUrl { get; set; }
}

/// <summary>
/// Model for moving a task between columns
/// </summary>
public class KanbanMoveModel
{
    public Guid? ColumnId { get; set; }
    public int SortOrder { get; set; }
}

/// <summary>
/// Model for reordering tasks within a column
/// </summary>
public class KanbanReorderModel
{
    public List<KanbanTaskOrderItem> TaskOrders { get; set; } = new();
}

/// <summary>
/// Individual task order item
/// </summary>
public class KanbanTaskOrderItem
{
    public Guid TaskId { get; set; }
    public int SortOrder { get; set; }
}

/// <summary>
/// Column statistics for quick overview
/// </summary>
public class KanbanColumnStatsModel
{
    public Guid ColumnId { get; set; }
    public string ColumnName { get; set; } = null!;
    public int TaskCount { get; set; }
    public int? WipLimit { get; set; }
    public bool IsOverWipLimit { get; set; }
}

#endregion
