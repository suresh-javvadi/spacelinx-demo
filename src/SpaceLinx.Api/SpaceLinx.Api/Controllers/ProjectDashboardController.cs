using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

/// <summary>
/// Controller for project dashboard data aggregation
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProjectDashboardController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) : BaseController(spaceLinxContext, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get task summary for a project or all projects
    /// </summary>
    [HttpGet("task-summary")]
    public async Task<ActionResult<TaskSummaryModel>> GetTaskSummaryAsync([FromQuery] Guid? projectId = null)
    {
        var query = _context.Tasks
            .Where(t => t.DeletedAt == null);

        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
        }

        var tasks = await query.ToListAsync();

        var summary = new TaskSummaryModel
        {
            TotalTasks = tasks.Count,
            CompletedTasks = tasks.Count(t => t.Status == "Completed"),
            InProgressTasks = tasks.Count(t => t.Status == "In Progress"),
            ToDoTasks = tasks.Count(t => t.Status == "To Do"),
            LoggedTasks = tasks.Count(t => t.Status == "Logged"),
            OverdueTasks = tasks.Count(t => t.DueDate < DateTime.UtcNow && t.Status != "Completed"),
            HighPriorityTasks = tasks.Count(t => t.Priority == "High" && t.Status != "Completed"),
            AverageProgress = tasks.Count > 0 ? Math.Round(tasks.Average(t => t.ProgressPercent ?? 0), 1) : 0
        };

        return Ok(summary);
    }

    /// <summary>
    /// Get project progress for all projects
    /// </summary>
    [HttpGet("project-progress")]
    public async Task<ActionResult<IEnumerable<ProjectProgressModel>>> GetProjectProgressAsync()
    {
        var projects = await _context.Projects
            .Where(p => p.DeletedAt == null)
            .Include(p => p.Program)
            .AsNoTracking()
            .ToListAsync();

        var progressList = new List<ProjectProgressModel>();

        foreach (var project in projects)
        {
            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == project.Id && t.DeletedAt == null)
                .ToListAsync();

            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.Status == "Completed");
            var progress = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;
            var avgProgress = tasks.Count > 0 ? Math.Round(tasks.Average(t => t.ProgressPercent ?? 0), 1) : 0;

            progressList.Add(new ProjectProgressModel
            {
                ProjectId = project.Id!.Value,
                ProjectName = project.Name,
                ProjectCode = project.ProjectCode,
                ProgramName = project.Program?.Name,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                CompletionPercent = progress,
                AverageTaskProgress = avgProgress,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                Status = project.Status
            });
        }

        return Ok(progressList.OrderByDescending(p => p.TotalTasks));
    }

    /// <summary>
    /// Get overdue tasks
    /// </summary>
    [HttpGet("overdue-tasks")]
    public async Task<ActionResult<IEnumerable<TaskReadModel>>> GetOverdueTasksAsync(
        [FromQuery] Guid? projectId = null,
        [FromQuery] int limit = 10)
    {
        var query = _context.Tasks
            .Where(t => t.DeletedAt == null
                && t.Status != "Completed"
                && t.DueDate < DateTime.UtcNow);

        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
        }

        var tasks = await query
            .Include(t => t.AssignedTo)
            .Include(t => t.Project)
            .OrderBy(t => t.DueDate)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskReadModel>>(tasks));
    }

    /// <summary>
    /// Get current user's tasks
    /// </summary>
    [HttpGet("my-tasks")]
    public async Task<ActionResult<IEnumerable<TaskReadModel>>> GetMyTasksAsync([FromQuery] int limit = 10)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(s => s.Email == UserEmail && s.DeletedAt == null);

        if (user == null)
        {
            return Ok(new List<TaskReadModel>());
        }

        var tasks = await _context.Tasks
            .Where(t => t.DeletedAt == null
                && t.Status != "Completed"
                && (t.AssignedToId == user.Id ||
                    t.Assignees.Any(a => a.UserId == user.Id && a.DeletedAt == null)))
            .Include(t => t.Project)
            .Include(t => t.Milestone)
            .OrderBy(t => t.DueDate)
            .ThenByDescending(t => t.Priority == "High" ? 0 : t.Priority == "Medium" ? 1 : 2)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskReadModel>>(tasks));
    }

    /// <summary>
    /// Get team workload summary
    /// </summary>
    [HttpGet("team-workload")]
    public async Task<ActionResult<IEnumerable<TeamWorkloadModel>>> GetTeamWorkloadAsync([FromQuery] Guid? projectId = null)
    {
        var userList = await _context.Users
            .Where(s => s.DeletedAt == null && s.IsActive)
            .AsNoTracking()
            .ToListAsync();

        var workloadList = new List<TeamWorkloadModel>();

        foreach (var user in userList)
        {
            var taskQuery = _context.Tasks
                .Where(t => t.DeletedAt == null
                    && t.Status != "Completed"
                    && (t.AssignedToId == user.Id ||
                        t.Assignees.Any(a => a.UserId == user.Id && a.DeletedAt == null)));

            if (projectId.HasValue)
            {
                taskQuery = taskQuery.Where(t => t.ProjectId == projectId.Value);
            }

            var tasks = await taskQuery.ToListAsync();

            if (tasks.Count > 0)
            {
                workloadList.Add(new TeamWorkloadModel
                {
                    UserId = user.Id!.Value,
                    UserName = $"{user.FirstName} {user.LastName}",
                    Email = user.Email,
                    ImageUrl = user.ImageUrl,
                    ActiveTasks = tasks.Count,
                    HighPriorityTasks = tasks.Count(t => t.Priority == "High"),
                    OverdueTasks = tasks.Count(t => t.DueDate < DateTime.UtcNow),
                    TotalEstimatedHours = tasks.Sum(t => t.EstimatedHours ?? 0)
                });
            }
        }

        return Ok(workloadList.OrderByDescending(w => w.ActiveTasks));
    }

    /// <summary>
    /// Get recent activity
    /// </summary>
    [HttpGet("recent-activity")]
    public async Task<ActionResult<IEnumerable<TaskActivityReadModel>>> GetRecentActivityAsync(
        [FromQuery] Guid? projectId = null,
        [FromQuery] int limit = 20)
    {
        var query = _context.TaskActivities.AsQueryable();

        if (projectId.HasValue)
        {
            var taskIds = await _context.Tasks
                .Where(t => t.ProjectId == projectId.Value)
                .Select(t => t.Id)
                .ToListAsync();

            query = query.Where(a => taskIds.Contains(a.TaskId));
        }

        var activities = await query
            .Include(a => a.Task)
            .OrderByDescending(a => a.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskActivityReadModel>>(activities));
    }

    /// <summary>
    /// Get status distribution
    /// </summary>
    [HttpGet("status-distribution")]
    public async Task<ActionResult<IEnumerable<StatusDistributionModel>>> GetStatusDistributionAsync([FromQuery] Guid? projectId = null)
    {
        var query = _context.Tasks
            .Where(t => t.DeletedAt == null);

        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
        }

        var distribution = await query
            .GroupBy(t => t.Status)
            .Select(g => new StatusDistributionModel
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        return Ok(distribution);
    }

    /// <summary>
    /// Get priority breakdown
    /// </summary>
    [HttpGet("priority-breakdown")]
    public async Task<ActionResult<IEnumerable<PriorityBreakdownModel>>> GetPriorityBreakdownAsync([FromQuery] Guid? projectId = null)
    {
        var query = _context.Tasks
            .Where(t => t.DeletedAt == null && t.Status != "Completed");

        if (projectId.HasValue)
        {
            query = query.Where(t => t.ProjectId == projectId.Value);
        }

        var breakdown = await query
            .GroupBy(t => t.Priority)
            .Select(g => new PriorityBreakdownModel
            {
                Priority = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        return Ok(breakdown);
    }

    /// <summary>
    /// Get time logged chart data
    /// </summary>
    [HttpGet("time-logged-chart")]
    public async Task<ActionResult<IEnumerable<TimeLoggedChartModel>>> GetTimeLoggedChartAsync(
        [FromQuery] Guid? projectId = null,
        [FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.Date.AddDays(-days);

        var query = _context.TimeEntries
            .Where(e => e.DeletedAt == null && e.EntryDate >= startDate);

        if (projectId.HasValue)
        {
            var taskIds = await _context.Tasks
                .Where(t => t.ProjectId == projectId.Value)
                .Select(t => t.Id)
                .ToListAsync();

            query = query.Where(e => taskIds.Contains(e.TaskId));
        }

        var chartData = await query
            .GroupBy(e => e.EntryDate.Date)
            .Select(g => new TimeLoggedChartModel
            {
                Date = g.Key,
                Hours = g.Sum(e => e.HoursWorked)
            })
            .OrderBy(c => c.Date)
            .ToListAsync();

        return Ok(chartData);
    }

    /// <summary>
    /// Get milestone tracker data
    /// </summary>
    [HttpGet("milestone-tracker")]
    public async Task<ActionResult<IEnumerable<MilestoneTrackerModel>>> GetMilestoneTrackerAsync([FromQuery] Guid? projectId = null)
    {
        var query = _context.Milestones
            .Where(m => m.DeletedAt == null);

        if (projectId.HasValue)
        {
            query = query.Where(m => m.ProjectId == projectId.Value);
        }

        var milestones = await query
            .Include(m => m.Project)
            .OrderBy(m => m.TargetDate)
            .AsNoTracking()
            .ToListAsync();

        var trackerData = new List<MilestoneTrackerModel>();

        foreach (var milestone in milestones)
        {
            var tasksInMilestone = await _context.Tasks
                .Where(t => t.MilestoneId == milestone.Id && t.DeletedAt == null)
                .ToListAsync();

            var totalTasks = tasksInMilestone.Count;
            var completedTasks = tasksInMilestone.Count(t => t.Status == "Completed");
            var progress = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 1) : 0;

            trackerData.Add(new MilestoneTrackerModel
            {
                MilestoneId = milestone.Id!.Value,
                MilestoneName = milestone.Name,
                ProjectId = milestone.ProjectId,
                ProjectName = milestone.Project?.Name,
                TargetDate = milestone.TargetDate,
                Status = milestone.Status,
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                Progress = progress,
                IsOverdue = milestone.TargetDate < DateTime.UtcNow && milestone.Status != "Completed"
            });
        }

        return Ok(trackerData);
    }
}

#region Dashboard Models

public class TaskSummaryModel
{
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public int InProgressTasks { get; set; }
    public int ToDoTasks { get; set; }
    public int LoggedTasks { get; set; }
    public int OverdueTasks { get; set; }
    public int HighPriorityTasks { get; set; }
    public double AverageProgress { get; set; }
}

public class ProjectProgressModel
{
    public Guid ProjectId { get; set; }
    public string ProjectName { get; set; } = null!;
    public string? ProjectCode { get; set; }
    public string? ProgramName { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double CompletionPercent { get; set; }
    public double AverageTaskProgress { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Status { get; set; }
}

public class TeamWorkloadModel
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = null!;
    public string? Email { get; set; }
    public string? ImageUrl { get; set; }
    public int ActiveTasks { get; set; }
    public int HighPriorityTasks { get; set; }
    public int OverdueTasks { get; set; }
    public decimal TotalEstimatedHours { get; set; }
}

public class StatusDistributionModel
{
    public string Status { get; set; } = null!;
    public int Count { get; set; }
}

public class PriorityBreakdownModel
{
    public string Priority { get; set; } = null!;
    public int Count { get; set; }
}

public class TimeLoggedChartModel
{
    public DateTime Date { get; set; }
    public decimal Hours { get; set; }
}

public class MilestoneTrackerModel
{
    public Guid MilestoneId { get; set; }
    public string MilestoneName { get; set; } = null!;
    public Guid? ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public DateTime? TargetDate { get; set; }
    public string? Status { get; set; }
    public int TotalTasks { get; set; }
    public int CompletedTasks { get; set; }
    public double Progress { get; set; }
    public bool IsOverdue { get; set; }
}

#endregion
