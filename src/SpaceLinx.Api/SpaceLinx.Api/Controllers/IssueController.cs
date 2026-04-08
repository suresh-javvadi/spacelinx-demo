using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class IssueController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IJiraService jiraService) :
    GenericRestController<Issue, IssueWriteModel, IssueUpdateModel, IssueReadModel, IssueRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpPost("Issue")]
    public async Task<IActionResult> CreateIssue([FromBody] IssueWriteModel issueWriteModel)
    {
        var issue = new Issue
        {
            ProjectName = issueWriteModel.ProjectName,
            IssueType = issueWriteModel.IssueType,
            Priority = issueWriteModel.Priority,
            Summary = issueWriteModel.Summary,
            Description = issueWriteModel.Description,
            ProductId = issueWriteModel.ProductId,
            GuideId = issueWriteModel.GuideId,
            WorkOrderId = issueWriteModel.WorkOrderId,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await spaceLinxContext.Issues.AddAsync(issue);
        await spaceLinxContext.SaveChangesAsync();

        if (jiraService.IsEnabled)
        {
            try
            {
                string jiraKey = await jiraService.CreateJiraIssueAsync(issueWriteModel);
                issue.JiraId = jiraKey;
                await spaceLinxContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Jira issue creation failed: {ex.Message}");
            }
        }

        return CreatedAtAction(nameof(Get), new { id = issue.Id }, issue);
    }

    [HttpPut("{id}/issue")]
    public async Task<IActionResult> UpdateIssue(Guid id, IssueUpdateModel request)
    {
        var issue = await spaceLinxContext.Issues.FindAsync(id);
        if (issue == null)
        {
            return NotFound();
        }

        issue.ProjectName = request.ProjectName;
        issue.IssueType = request.IssueType;
        issue.Priority = request.Priority;
        issue.Summary = request.Summary;
        issue.Description = request.Description;
        issue.ProductId = request.ProductId;
        issue.GuideId = request.GuideId;
        issue.WorkOrderId = request.WorkOrderId;
        issue.UpdatedBy = UserEmail;
        issue.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        if (jiraService.IsEnabled)
        {
            try
            {
                await jiraService.UpdateJiraIssueAsync(issue.JiraId, request);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Jira issue update failed: {ex.Message}");
            }
        }

        return NoContent();
    }
}