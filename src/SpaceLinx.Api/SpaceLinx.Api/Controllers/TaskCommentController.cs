using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

public class TaskCommentController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IUserService userService) :
GenericRestController<TaskComment, TaskCommentWriteModel, TaskCommentUpdateModel, TaskCommentReadModel, TaskCommentRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    private readonly SpaceLinxContext _context = spaceLinxContext;
    private readonly IMapper _mapper = mapper;

    /// <summary>
    /// Get all comments for a specific task (with nested replies)
    /// </summary>
    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<TaskCommentReadModel>>> GetByTaskAsync(Guid taskId)
    {
        // Get root-level comments (no parent)
        var comments = await _context.TaskComments
            .Where(c => c.TaskId == taskId && c.ParentCommentId == null && c.DeletedAt == null)
            .Include(c => c.Replies.Where(r => r.DeletedAt == null))
            .OrderBy(c => c.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskCommentReadModel>>(comments));
    }

    /// <summary>
    /// Get replies for a specific comment
    /// </summary>
    [HttpGet("{commentId}/replies")]
    public async Task<ActionResult<IEnumerable<TaskCommentReadModel>>> GetRepliesAsync(Guid commentId)
    {
        var replies = await _context.TaskComments
            .Where(c => c.ParentCommentId == commentId && c.DeletedAt == null)
            .OrderBy(c => c.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return Ok(_mapper.Map<IEnumerable<TaskCommentReadModel>>(replies));
    }

    /// <summary>
    /// Create a new comment with activity logging
    /// </summary>
    [HttpPost("create")]
    public async Task<ActionResult<TaskCommentReadModel>> CreateCommentAsync([FromBody] TaskCommentWriteModel model)
    {
        var task = await _context.Tasks.FindAsync(model.TaskId);
        if (task == null || task.DeletedAt != null)
        {
            return NotFound("Task not found");
        }

        var comment = _mapper.Map<TaskComment>(model);
        comment.IsActive = true;
        comment.CreatedAt = DateTime.UtcNow;
        comment.CreatedBy = UserEmail;

        _context.TaskComments.Add(comment);

        // Log the activity
        var activity = new TaskActivity
        {
            TaskId = model.TaskId,
            ActivityType = "CommentAdded",
            Description = "New comment added",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail
        };
        _context.TaskActivities.Add(activity);

        await _context.SaveChangesAsync();

        return Ok(_mapper.Map<TaskCommentReadModel>(comment));
    }
}
