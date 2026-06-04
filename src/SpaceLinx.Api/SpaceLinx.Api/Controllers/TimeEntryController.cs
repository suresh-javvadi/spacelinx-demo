using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class TimeEntryController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
GenericRestController<TimeEntry, TimeEntryWriteModel, TimeEntryUpdateModel, TimeEntryReadModel, TimeEntryRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all time entries for a specific task
    /// </summary>
    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TimeEntryReadModel>>> GetByTaskAsync(Guid taskId)
    {
        var entries = await _context.TimeEntries
            .Where(e => e.TaskId == taskId && e.DeletedAt == null)
            .Include(e => e.Task)
            .Include(e => e.User)
            .OrderByDescending(e => e.EntryDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TimeEntryReadModel>>(entries));
    }

    /// <summary>
    /// Get time summary for a specific task
    /// </summary>
    [HttpGet("task/{taskId}/summary")]
    public async Task<ActionResult<object>> GetTaskSummaryAsync(Guid taskId)
    {
        var task = await _context.Tasks
            .Where(t => t.Id == taskId && t.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (task == null)
        {
            return NotFound("Task not found");
        }

        var entries = await _context.TimeEntries
            .Where(e => e.TaskId == taskId && e.DeletedAt == null)
            .AsNoTracking()
            .ToListAsync();

        var summary = new
        {
            TaskId = taskId,
            TaskName = task.Name,
            EstimatedHours = task.EstimatedHours,
            TotalHoursLogged = entries.Sum(e => e.HoursWorked),
            BillableHours = entries.Where(e => e.Billable == true).Sum(e => e.HoursWorked),
            NonBillableHours = entries.Where(e => e.Billable != true).Sum(e => e.HoursWorked),
            EntryCount = entries.Count,
            HoursByWorkType = entries
                .GroupBy(e => e.WorkType)
                .Select(g => new { WorkType = g.Key, Hours = g.Sum(e => e.HoursWorked) })
                .ToList(),
            HoursByUser = entries
                .GroupBy(e => e.UserId)
                .Select(g => new { UserId = g.Key, Hours = g.Sum(e => e.HoursWorked) })
                .ToList()
        };

        return Ok(summary);
    }

    /// <summary>
    /// Get all time entries for a specific user member
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<TimeEntryReadModel>>> GetByUserAsync(Guid userId)
    {
        var entries = await _context.TimeEntries
            .Where(e => e.UserId == userId && e.DeletedAt == null)
            .Include(e => e.Task)
            .Include(e => e.User)
            .OrderByDescending(e => e.EntryDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TimeEntryReadModel>>(entries));
    }

    /// <summary>
    /// Get current user's time entries
    /// </summary>
    [HttpGet("my-entries")]
    public async Task<ActionResult<IEnumerable<TimeEntryReadModel>>> GetMyEntriesAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        // Find user by user email
        var user = await _context.Users
            .FirstOrDefaultAsync(s => s.Email == UserEmail && s.DeletedAt == null);

        if (user == null)
        {
            return NotFound("User record not found for current user");
        }

        var query = _context.TimeEntries
            .Where(e => e.UserId == user.Id && e.DeletedAt == null);

        if (startDate.HasValue)
        {
            query = query.Where(e => e.EntryDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(e => e.EntryDate <= endDate.Value);
        }

        var entries = await query
            .Include(e => e.Task)
            .Include(e => e.User)
            .OrderByDescending(e => e.EntryDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TimeEntryReadModel>>(entries));
    }

    /// <summary>
    /// Get time entries for a project (all tasks within the project)
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<TimeEntryReadModel>>> GetByProjectAsync(Guid projectId)
    {
        var taskIds = await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.DeletedAt == null)
            .Select(t => t.Id)
            .ToListAsync();

        var entries = await _context.TimeEntries
            .Where(e => taskIds.Contains(e.TaskId) && e.DeletedAt == null)
            .Include(e => e.Task)
            .Include(e => e.User)
            .OrderByDescending(e => e.EntryDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TimeEntryReadModel>>(entries));
    }

    /// <summary>
    /// Get project time summary
    /// </summary>
    [HttpGet("project/{projectId}/summary")]
    public async Task<ActionResult<object>> GetProjectSummaryAsync(Guid projectId)
    {
        var project = await _context.Projects
            .Where(p => p.Id == projectId && p.DeletedAt == null)
            .FirstOrDefaultAsync();

        if (project == null)
        {
            return NotFound("Project not found");
        }

        var taskIds = await _context.Tasks
            .Where(t => t.ProjectId == projectId && t.DeletedAt == null)
            .Select(t => t.Id)
            .ToListAsync();

        var entries = await _context.TimeEntries
            .Where(e => taskIds.Contains(e.TaskId) && e.DeletedAt == null)
            .Include(e => e.Task)
            .AsNoTracking()
            .ToListAsync();

        var summary = new
        {
            ProjectId = projectId,
            ProjectName = project.Name,
            TotalHoursLogged = entries.Sum(e => e.HoursWorked),
            BillableHours = entries.Where(e => e.Billable == true).Sum(e => e.HoursWorked),
            NonBillableHours = entries.Where(e => e.Billable != true).Sum(e => e.HoursWorked),
            EntryCount = entries.Count,
            HoursByTask = entries
                .GroupBy(e => new { e.TaskId, TaskName = e.Task?.Name ?? "Unknown" })
                .Select(g => new { g.Key.TaskId, g.Key.TaskName, Hours = g.Sum(e => e.HoursWorked) })
                .OrderByDescending(x => x.Hours)
                .ToList(),
            HoursByUser = entries
                .GroupBy(e => e.UserId)
                .Select(g => new { UserId = g.Key, Hours = g.Sum(e => e.HoursWorked) })
                .ToList(),
            HoursByWorkType = entries
                .GroupBy(e => e.WorkType)
                .Select(g => new { WorkType = g.Key, Hours = g.Sum(e => e.HoursWorked) })
                .ToList()
        };

        return Ok(summary);
    }

    /// <summary>
    /// Log time entry with activity logging
    /// </summary>
    [HttpPost("log")]
    public async Task<ActionResult<TimeEntryReadModel>> LogTimeAsync([FromBody] TimeEntryWriteModel model)
    {
        var task = await _context.Tasks.FindAsync(model.TaskId);
        if (task == null || task.DeletedAt != null)
        {
            return NotFound("Task not found");
        }

        var user = await _context.Users.FindAsync(model.UserId);
        if (user == null || user.DeletedAt != null)
        {
            return NotFound("User not found");
        }

        var entry = _mapper.Map<TimeEntry>(model);
        entry.IsActive = true;
        entry.CreatedAt = DateTime.UtcNow;
        entry.CreatedBy = UserEmail;

        _context.TimeEntries.Add(entry);

        // Update task's actual hours
        task.ActualHours = (task.ActualHours ?? 0) + model.HoursWorked;
        task.UpdatedAt = DateTime.UtcNow;
        task.UpdatedBy = UserEmail;

        // Log the activity
        var activity = new TaskActivity
        {
            TaskId = model.TaskId,
            ActivityType = "TimeLogged",
            FieldChanged = "ActualHours",
            OldValue = ((task.ActualHours ?? 0) - model.HoursWorked).ToString("F2"),
            NewValue = task.ActualHours?.ToString("F2") ?? "0",
            Description = $"Logged {model.HoursWorked:F2} hours ({model.WorkType})",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail
        };
        _context.TaskActivities.Add(activity);

        await _context.SaveChangesAsync();

        // Reload with includes for response
        var createdEntry = await _context.TimeEntries
            .Include(e => e.Task)
            .Include(e => e.User)
            .FirstOrDefaultAsync(e => e.Id == entry.Id);

        return Ok(_mapper.Map<TimeEntryReadModel>(createdEntry));
    }

    /// <summary>
    /// Get time report with filters
    /// </summary>
    [HttpGet("report")]
    public async Task<ActionResult<object>> GetTimeReportAsync(
        [FromQuery] Guid? projectId = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] bool? billable = null,
        [FromQuery] string? workType = null)
    {
        var query = _context.TimeEntries
            .Where(e => e.DeletedAt == null);

        if (projectId.HasValue)
        {
            var taskIds = await _context.Tasks
                .Where(t => t.ProjectId == projectId.Value && t.DeletedAt == null)
                .Select(t => t.Id)
                .ToListAsync();

            query = query.Where(e => taskIds.Contains(e.TaskId));
        }

        if (userId.HasValue)
        {
            query = query.Where(e => e.UserId == userId.Value);
        }

        if (startDate.HasValue)
        {
            query = query.Where(e => e.EntryDate >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(e => e.EntryDate <= endDate.Value);
        }

        if (billable.HasValue)
        {
            query = query.Where(e => e.Billable == billable.Value);
        }

        if (!string.IsNullOrEmpty(workType))
        {
            query = query.Where(e => e.WorkType == workType);
        }

        var entries = await query
            .Include(e => e.Task)
            .Include(e => e.User)
            .OrderByDescending(e => e.EntryDate)
            .AsNoTracking()
            .ToListAsync();

        var report = new
        {
            Filters = new
            {
                ProjectId = projectId,
                UserId = userId,
                StartDate = startDate,
                EndDate = endDate,
                Billable = billable,
                WorkType = workType
            },
            Summary = new
            {
                TotalHours = entries.Sum(e => e.HoursWorked),
                BillableHours = entries.Where(e => e.Billable == true).Sum(e => e.HoursWorked),
                NonBillableHours = entries.Where(e => e.Billable != true).Sum(e => e.HoursWorked),
                EntryCount = entries.Count
            },
            ByDate = entries
                .GroupBy(e => e.EntryDate.Date)
                .Select(g => new { Date = g.Key, Hours = g.Sum(e => e.HoursWorked) })
                .OrderBy(x => x.Date)
                .ToList(),
            ByUser = entries
                .GroupBy(e => new { e.UserId, UserName = $"{e.User?.FirstName} {e.User?.LastName}".Trim() })
                .Select(g => new { g.Key.UserId, g.Key.UserName, Hours = g.Sum(e => e.HoursWorked) })
                .OrderByDescending(x => x.Hours)
                .ToList(),
            ByWorkType = entries
                .GroupBy(e => e.WorkType)
                .Select(g => new { WorkType = g.Key, Hours = g.Sum(e => e.HoursWorked) })
                .OrderByDescending(x => x.Hours)
                .ToList(),
            Entries = _mapper.Map<IEnumerable<TimeEntryReadModel>>(entries)
        };

        return Ok(report);
    }
}
