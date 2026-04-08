using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class TaskAssigneeController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
GenericRestController<TaskAssignee, TaskAssigneeWriteModel, TaskAssigneeUpdateModel, TaskAssigneeReadModel, TaskAssigneeRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all assignees for a specific task
    /// </summary>
    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TaskAssigneeReadModel>>> GetByTaskAsync(Guid taskId)
    {
        var assignees = await _context.TaskAssignees
            .Where(a => a.TaskId == taskId && a.DeletedAt == null)
            .Include(a => a.User)
            .OrderBy(a => a.AssigneeRole)
            .ThenBy(a => a.AssignedAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskAssigneeReadModel>>(assignees));
    }

    /// <summary>
    /// Get all tasks assigned to a specific user member
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TaskAssigneeReadModel>>> GetByUserAsync(Guid userId)
    {
        var assignments = await _context.TaskAssignees
            .Where(a => a.UserId == userId && a.DeletedAt == null && a.Task!.DeletedAt == null)
            .Include(a => a.Task)
                .ThenInclude(t => t!.Project)
            .OrderBy(a => a.Task!.DueDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskAssigneeReadModel>>(assignments));
    }

    /// <summary>
    /// Bulk assign multiple user members to a task
    /// </summary>
    [HttpPost("task/{taskId}/bulk")]
    public async Task<ActionResult<IEnumerable<TaskAssigneeReadModel>>> BulkAssignAsync(Guid taskId, [FromBody] BulkAssignModel model)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null || task.DeletedAt != null)
        {
            return NotFound("Task not found");
        }

        var createdAssignees = new List<TaskAssignee>();

        foreach (var assignment in model.Assignments)
        {
            // Check if already assigned
            var existing = await _context.TaskAssignees
                .FirstOrDefaultAsync(a => a.TaskId == taskId && a.UserId == assignment.UserId && a.DeletedAt == null);

            if (existing != null)
            {
                continue; // Skip if already assigned
            }

            var assignee = new TaskAssignee
            {
                TaskId = taskId,
                UserId = assignment.UserId,
                AssigneeRole = assignment.AssigneeRole ?? "Secondary",
                AssignedAt = DateTime.UtcNow,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = UserEmail
            };

            _context.TaskAssignees.Add(assignee);
            createdAssignees.Add(assignee);

            // Log the activity
            var activity = new TaskActivity
            {
                TaskId = taskId,
                ActivityType = "AssigneeAdded",
                NewValue = assignment.UserId.ToString(),
                Description = $"Assignee added with role '{assignment.AssigneeRole ?? "Secondary"}'",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = UserEmail
            };
            _context.TaskActivities.Add(activity);
        }

        await _context.SaveChangesAsync();

        // Reload with user info
        var result = await _context.TaskAssignees
            .Where(a => createdAssignees.Select(c => c.Id).Contains(a.Id))
            .Include(a => a.User)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskAssigneeReadModel>>(result));
    }
}

public class BulkAssignModel
{
    public List<AssignmentItem> Assignments { get; set; } = new();
}

public class AssignmentItem
{
    public Guid UserId { get; set; }
    public string? AssigneeRole { get; set; }
}
