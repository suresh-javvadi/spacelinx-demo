using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class DashboardWidgetController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
GenericRestController<DashboardWidget, DashboardWidgetWriteModel, DashboardWidgetUpdateModel, DashboardWidgetReadModel, DashboardWidgetRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all dashboard widgets for a specific user
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<DashboardWidgetReadModel>>> GetByUserAsync(Guid userId)
    {
        var widgets = await _context.DashboardWidgets
            .Where(w => w.UserId == userId && w.DeletedAt == null)
            .Include(w => w.Project)
            .OrderBy(w => w.PositionY)
            .ThenBy(w => w.PositionX)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<DashboardWidgetReadModel>>(widgets));
    }

    /// <summary>
    /// Get current user's dashboard widgets
    /// </summary>
    [HttpGet("my-dashboard")]
    public async Task<ActionResult<IEnumerable<DashboardWidgetReadModel>>> GetMyDashboardAsync()
    {
        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == UserEmail && u.DeletedAt == null);

        if (user == null)
        {
            return Ok(new List<DashboardWidgetReadModel>());
        }

        var widgets = await _context.DashboardWidgets
            .Where(w => w.UserId == user.Id && w.DeletedAt == null)
            .Include(w => w.Project)
            .OrderBy(w => w.PositionY)
            .ThenBy(w => w.PositionX)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<DashboardWidgetReadModel>>(widgets));
    }

    /// <summary>
    /// Bulk update widget positions (for drag-drop layout changes)
    /// </summary>
    [HttpPut("bulk-positions")]
    public async Task<ActionResult> BulkUpdatePositionsAsync([FromBody] List<WidgetPositionUpdateModel> updates)
    {
        foreach (var update in updates)
        {
            var widget = await _context.DashboardWidgets.FindAsync(update.WidgetId);
            if (widget != null && widget.DeletedAt == null)
            {
                widget.PositionX = update.PositionX;
                widget.PositionY = update.PositionY;
                widget.Width = update.Width;
                widget.Height = update.Height;
                widget.UpdatedAt = DateTime.UtcNow;
                widget.UpdatedBy = UserEmail;
            }
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    /// <summary>
    /// Create default dashboard for a user
    /// </summary>
    [HttpPost("create-default/{userId}")]
    public async Task<ActionResult<IEnumerable<DashboardWidgetReadModel>>> CreateDefaultDashboardAsync(Guid userId)
    {
        // Check if user already has widgets
        var existingWidgets = await _context.DashboardWidgets
            .Where(w => w.UserId == userId && w.DeletedAt == null)
            .CountAsync();

        if (existingWidgets > 0)
        {
            return BadRequest("User already has dashboard widgets");
        }

        var defaultWidgets = new List<DashboardWidget>
        {
            new() { UserId = userId, WidgetType = "MyTasks", Title = "My Tasks", PositionX = 0, PositionY = 0, Width = 6, Height = 3, CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { UserId = userId, WidgetType = "TaskSummary", Title = "Task Summary", PositionX = 6, PositionY = 0, Width = 3, Height = 2, CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { UserId = userId, WidgetType = "OverdueTasks", Title = "Overdue Tasks", PositionX = 9, PositionY = 0, Width = 3, Height = 2, CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { UserId = userId, WidgetType = "RecentActivity", Title = "Recent Activity", PositionX = 0, PositionY = 3, Width = 6, Height = 3, CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { UserId = userId, WidgetType = "ProjectProgress", Title = "Project Progress", PositionX = 6, PositionY = 2, Width = 6, Height = 4, CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
        };

        _context.DashboardWidgets.AddRange(defaultWidgets);
        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<IEnumerable<DashboardWidgetReadModel>>(defaultWidgets));
    }
}

/// <summary>
/// Model for bulk position updates
/// </summary>
public class WidgetPositionUpdateModel
{
    public Guid WidgetId { get; set; }
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public int Width { get; set; }
    public int Height { get; set; }
}
