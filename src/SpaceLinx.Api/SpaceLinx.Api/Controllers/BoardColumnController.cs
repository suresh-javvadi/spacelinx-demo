using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

/// <summary>
/// Controller for Kanban board column management
/// </summary>
public class BoardColumnController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor) :
GenericRestController<BoardColumn, BoardColumnWriteModel, BoardColumnUpdateModel, BoardColumnReadModel, BoardColumnRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all columns for a specific project
    /// </summary>
    [HttpGet("project/{projectId}")]
    public async Task<ActionResult<IEnumerable<BoardColumnReadModel>>> GetByProjectAsync(Guid projectId)
    {
        var columns = await _context.BoardColumns
            .Where(c => c.ProjectId == projectId && c.DeletedAt == null)
            .Include(c => c.Project)
            .OrderBy(c => c.Position)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<BoardColumnReadModel>>(columns));
    }

    /// <summary>
    /// Reorder columns within a project
    /// </summary>
    [HttpPut("project/{projectId}/reorder")]
    public async Task<ActionResult> ReorderColumnsAsync(Guid projectId, [FromBody] BoardColumnReorderModel model)
    {
        foreach (var item in model.ColumnOrders)
        {
            var column = await _context.BoardColumns.FindAsync(item.ColumnId);
            if (column != null && column.ProjectId == projectId && column.DeletedAt == null)
            {
                column.Position = item.Position;
                column.UpdatedAt = DateTime.UtcNow;
                column.UpdatedBy = UserEmail;
            }
        }

        await _context.SaveChangesAsync();

        return Ok();
    }

    /// <summary>
    /// Set a column as the default column for new tasks
    /// </summary>
    [HttpPut("{id}/set-default")]
    public async Task<ActionResult<BoardColumnReadModel>> SetAsDefaultAsync(Guid id)
    {
        var column = await _context.BoardColumns.FindAsync(id);

        if (column == null || column.DeletedAt != null)
        {
            return NotFound();
        }

        // Remove default flag from other columns in the same project
        var otherColumns = await _context.BoardColumns
            .Where(c => c.ProjectId == column.ProjectId && c.Id != id && c.IsDefault && c.DeletedAt == null)
            .ToListAsync();

        foreach (var other in otherColumns)
        {
            other.IsDefault = false;
            other.UpdatedAt = DateTime.UtcNow;
            other.UpdatedBy = UserEmail;
        }

        // Set this column as default
        column.IsDefault = true;
        column.UpdatedAt = DateTime.UtcNow;
        column.UpdatedBy = UserEmail;

        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<BoardColumnReadModel>(column));
    }

    /// <summary>
    /// Create default columns for a project
    /// </summary>
    [HttpPost("project/{projectId}/create-defaults")]
    public async Task<ActionResult<IEnumerable<BoardColumnReadModel>>> CreateDefaultColumnsAsync(Guid projectId)
    {
        // Check if project exists
        var project = await _context.Projects.FindAsync(projectId);
        if (project == null || project.DeletedAt != null)
        {
            return NotFound("Project not found");
        }

        // Check if columns already exist
        var existingColumns = await _context.BoardColumns
            .AnyAsync(c => c.ProjectId == projectId && c.DeletedAt == null);

        if (existingColumns)
        {
            return BadRequest("Columns already exist for this project");
        }

        var defaultColumns = new List<BoardColumn>
        {
            new() { ProjectId = projectId, Name = "Backlog", Position = 0, Color = "#9e9e9e", MapsToStatus = "Backlog", CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { ProjectId = projectId, Name = "To Do", Position = 1, Color = "#e0e0e0", MapsToStatus = "To Do", IsDefault = true, CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { ProjectId = projectId, Name = "In Progress", Position = 2, Color = "#2196f3", MapsToStatus = "In Progress", CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { ProjectId = projectId, Name = "Review", Position = 3, Color = "#ff9800", MapsToStatus = "Review", CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow },
            new() { ProjectId = projectId, Name = "Done", Position = 4, Color = "#4caf50", MapsToStatus = "Completed", CreatedBy = UserEmail, CreatedAt = DateTime.UtcNow }
        };

        _context.BoardColumns.AddRange(defaultColumns);
        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<IEnumerable<BoardColumnReadModel>>(defaultColumns));
    }
}

/// <summary>
/// Model for reordering columns
/// </summary>
public class BoardColumnReorderModel
{
    public List<BoardColumnOrderItem> ColumnOrders { get; set; } = new();
}

/// <summary>
/// Individual column order item
/// </summary>
public class BoardColumnOrderItem
{
    public Guid ColumnId { get; set; }
    public int Position { get; set; }
}
