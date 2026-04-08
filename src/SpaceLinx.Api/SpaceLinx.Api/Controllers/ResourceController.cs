using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class ResourceController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
GenericRestController<ResourceAllocation, ResourceAllocationWriteModel, ResourceAllocationUpdateModel, ResourceAllocationReadModel, ResourceAllocationRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all allocations for a specific user member
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<ResourceAllocationReadModel>>> GetBUserAsync(Guid userId)
    {
        var allocations = await _context.ResourceAllocations
            .Where(r => r.UserId == userId && r.DeletedAt == null)
            .Include(r => r.User)
            .Include(r => r.Project)
            .Include(r => r.Task)
            .OrderBy(r => r.StartDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<ResourceAllocationReadModel>>(allocations));
    }

    /// <summary>
    /// Get all allocations for a specific project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<ResourceAllocationReadModel>>> GetByProjectAsync(Guid projectId)
    {
        var allocations = await _context.ResourceAllocations
            .Where(r => r.ProjectId == projectId && r.DeletedAt == null)
            .Include(r => r.User)
            .Include(r => r.Project)
            .Include(r => r.Task)
            .OrderBy(r => r.StartDate)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<ResourceAllocationReadModel>>(allocations));
    }

    /// <summary>
    /// Get workload view for all active user
    /// </summary>
    [HttpGet("workload")]
    public async Task<ActionResult<IEnumerable<ResourceWorkloadModel>>> GetWorkloadAsync(
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var start = startDate ?? DateTime.UtcNow.Date;
        var end = endDate ?? DateTime.UtcNow.Date.AddDays(30);

        var userList = await _context.Users
            .Where(u => u.DeletedAt == null)
            .AsNoTracking()
            .ToListAsync();

        var workloadList = new List<ResourceWorkloadModel>();

        foreach (var user in userList)
        {
            // Get allocations for the date range
            var allocations = await _context.ResourceAllocations
                .Where(r => r.UserId == user.Id
                    && r.DeletedAt == null
                    && r.StartDate <= end
                    && r.EndDate >= start)
                .Include(r => r.Project)
                .Include(r => r.Task)
                .AsNoTracking()
                .ToListAsync();

            // Get assigned tasks
            var tasks = await _context.Tasks
                .Where(t => t.DeletedAt == null
                    && t.Status != "Completed"
                    && (t.AssignedToId == user.Id ||
                        t.Assignees.Any(a => a.UserId == user.Id && a.DeletedAt == null)))
                .CountAsync();

            // Get hours logged this week
            var weekStart = DateTime.UtcNow.Date.AddDays(-(int)DateTime.UtcNow.DayOfWeek);
            var hoursThisWeek = await _context.TimeEntries
                .Where(e => e.UserId == user.Id
                    && e.DeletedAt == null
                    && e.EntryDate >= weekStart)
                .SumAsync(e => e.HoursWorked);

            // Calculate today's allocation percentage
            var todayAllocations = allocations
                .Where(a => a.StartDate <= DateTime.UtcNow.Date && a.EndDate >= DateTime.UtcNow.Date)
                .Sum(a => a.AllocationPercent);

            workloadList.Add(new ResourceWorkloadModel
            {
                UserId = user.Id!.Value,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                ImageUrl = user.ImageUrl,
                Department = user.Department,
                JobTitle = user.JobTitle,
                TodayAllocationPercent = todayAllocations,
                ActiveTasksCount = tasks,
                HoursLoggedThisWeek = hoursThisWeek,
                Allocations = allocations.Select(a => new AllocationSummaryModel
                {
                    Id = a.Id!.Value,
                    ProjectId = a.ProjectId,
                    ProjectName = a.Project?.Name,
                    TaskId = a.TaskId,
                    TaskName = a.Task?.Name,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    AllocationPercent = a.AllocationPercent,
                    AllocationType = a.AllocationType
                }).ToList()
            });
        }

        return Ok(workloadList.OrderByDescending(w => w.TodayAllocationPercent));
    }

    /// <summary>
    /// Get capacity planning view for a date range
    /// </summary>
    [HttpGet("capacity")]
    public async Task<ActionResult<CapacityPlanningModel>> GetCapacityAsync(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] Guid? projectId = null)
    {
        var userList = await _context.Users
            .Where(u => u.DeletedAt == null)
            .AsNoTracking()
            .ToListAsync();

        var dailyCapacity = new List<DailyCapacityModel>();

        for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
        {
            // Skip weekends
            if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                continue;

            var allocationsForDay = await _context.ResourceAllocations
                .Where(r => r.DeletedAt == null
                    && r.StartDate <= date
                    && r.EndDate >= date)
                .ToListAsync();

            if (projectId.HasValue)
            {
                var projectAllocations = allocationsForDay.Where(a => a.ProjectId == projectId.Value);
                var allocatedHours = projectAllocations.Sum(a => a.AllocatedHoursPerDay);
                var allocatedPercent = projectAllocations.Sum(a => a.AllocationPercent);

                dailyCapacity.Add(new DailyCapacityModel
                {
                    Date = date,
                    TotalCapacityHours = userList.Count * 8,
                    AllocatedHours = allocatedHours,
                    AvailableHours = (userList.Count * 8) - allocatedHours,
                    AllocationPercent = userList.Count > 0 ? (double)allocatedPercent / userList.Count : 0
                });
            }
            else
            {
                var totalAllocatedHours = allocationsForDay.Sum(a => a.AllocatedHoursPerDay);
                var totalCapacity = userList.Count * 8;

                dailyCapacity.Add(new DailyCapacityModel
                {
                    Date = date,
                    TotalCapacityHours = totalCapacity,
                    AllocatedHours = totalAllocatedHours,
                    AvailableHours = totalCapacity - totalAllocatedHours,
                    AllocationPercent = totalCapacity > 0 ? (double)totalAllocatedHours / totalCapacity * 100 : 0
                });
            }
        }

        var result = new CapacityPlanningModel
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalUser = userList.Count,
            DailyCapacity = dailyCapacity,
            Summary = new CapacitySummaryModel
            {
                TotalWorkDays = dailyCapacity.Count,
                TotalCapacityHours = dailyCapacity.Sum(d => d.TotalCapacityHours),
                TotalAllocatedHours = dailyCapacity.Sum(d => d.AllocatedHours),
                TotalAvailableHours = dailyCapacity.Sum(d => d.AvailableHours),
                AverageUtilization = dailyCapacity.Count > 0 ? dailyCapacity.Average(d => d.AllocationPercent) : 0
            }
        };

        return Ok(result);
    }

    /// <summary>
    /// Check availability for a user member in a date range
    /// </summary>
    [HttpGet("availability/{userId}")]
    public async Task<ActionResult<UserAvailabilityModel>> GetUserAvailabilityAsync(
        Guid userId,
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == userId && u.DeletedAt == null);

        if (user == null)
        {
            return NotFound("User not found");
        }

        var allocations = await _context.ResourceAllocations
            .Where(r => r.UserId == userId
                && r.DeletedAt == null
                && r.StartDate <= endDate
                && r.EndDate >= startDate)
            .Include(r => r.Project)
            .AsNoTracking()
            .ToListAsync();

        var dailyAvailability = new List<DailyAvailabilityModel>();

        for (var date = startDate.Date; date <= endDate.Date; date = date.AddDays(1))
        {
            // Skip weekends
            if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday)
                continue;

            var dayAllocations = allocations
                .Where(a => a.StartDate <= date && a.EndDate >= date)
                .ToList();

            var totalAllocatedPercent = dayAllocations.Sum(a => a.AllocationPercent);
            var totalAllocatedHours = dayAllocations.Sum(a => a.AllocatedHoursPerDay);

            dailyAvailability.Add(new DailyAvailabilityModel
            {
                Date = date,
                AllocatedPercent = totalAllocatedPercent,
                AvailablePercent = Math.Max(0, 100 - totalAllocatedPercent),
                AllocatedHours = totalAllocatedHours,
                AvailableHours = Math.Max(0, 8 - totalAllocatedHours),
                Allocations = dayAllocations.Select(a => new AllocationSummaryModel
                {
                    Id = a.Id!.Value,
                    ProjectId = a.ProjectId,
                    ProjectName = a.Project?.Name,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    AllocationPercent = a.AllocationPercent,
                    AllocationType = a.AllocationType
                }).ToList()
            });
        }

        return Ok(new UserAvailabilityModel
        {
            UserId = user.Id!.Value,
            UserName = $"{user.FirstName} {user.LastName}",
            StartDate = startDate,
            EndDate = endDate,
            DailyAvailability = dailyAvailability,
            IsFullyAvailable = dailyAvailability.All(d => d.AvailablePercent >= 100),
            HasConflicts = dailyAvailability.Any(d => d.AllocatedPercent > 100)
        });
    }
}

#region Resource Models

public class ResourceWorkloadModel
{
    public Guid UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? ImageUrl { get; set; }
    public string? Department { get; set; }
    public string? JobTitle { get; set; }
    public int TodayAllocationPercent { get; set; }
    public int ActiveTasksCount { get; set; }
    public decimal HoursLoggedThisWeek { get; set; }
    public List<AllocationSummaryModel> Allocations { get; set; } = new();
}

public class AllocationSummaryModel
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string? ProjectName { get; set; }
    public Guid? TaskId { get; set; }
    public string? TaskName { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int AllocationPercent { get; set; }
    public string AllocationType { get; set; } = null!;
}

public class CapacityPlanningModel
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalUser { get; set; }
    public List<DailyCapacityModel> DailyCapacity { get; set; } = new();
    public CapacitySummaryModel Summary { get; set; } = new();
}

public class DailyCapacityModel
{
    public DateTime Date { get; set; }
    public decimal TotalCapacityHours { get; set; }
    public decimal AllocatedHours { get; set; }
    public decimal AvailableHours { get; set; }
    public double AllocationPercent { get; set; }
}

public class CapacitySummaryModel
{
    public int TotalWorkDays { get; set; }
    public decimal TotalCapacityHours { get; set; }
    public decimal TotalAllocatedHours { get; set; }
    public decimal TotalAvailableHours { get; set; }
    public double AverageUtilization { get; set; }
}

public class UserAvailabilityModel
{
    public Guid UserId { get; set; }
    public string UserName { get; set; } = null!;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<DailyAvailabilityModel> DailyAvailability { get; set; } = new();
    public bool IsFullyAvailable { get; set; }
    public bool HasConflicts { get; set; }
}

public class DailyAvailabilityModel
{
    public DateTime Date { get; set; }
    public int AllocatedPercent { get; set; }
    public int AvailablePercent { get; set; }
    public decimal AllocatedHours { get; set; }
    public decimal AvailableHours { get; set; }
    public List<AllocationSummaryModel> Allocations { get; set; } = new();
}

#endregion
