using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Services;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Interfaces;

public class ApprovalService(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor, ILogger<ApprovalService> logger)
        : BaseService(spaceLinxContext, _contextAccessor), IApprovalService
{
    #region Legacy ECO-specific methods (backward compatibility)

    public async Task<IActionResult> AddEcoApproversAsync(Guid ecoEntityId, List<ApprovalWriteModel> approvers, string userEmail)
    {
        return await AddApproversAsync(SpaceLinxEntities.Eco, ecoEntityId, approvers, userEmail);
    }

    public async Task<IActionResult> UpdateEcoApproversAsync(Guid ecoEntityId, List<ApprovalWriteModel> updatedApprovals)
    {
        return await UpdateApproversAsync(SpaceLinxEntities.Eco, ecoEntityId, updatedApprovals, UserEmail);
    }

    #endregion

    #region Configuration methods

    public async Task<ApprovalConfiguration?> GetConfigurationAsync(string entityType)
    {
        return await spaceLinxContext.ApprovalConfigurations
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.EntityType == entityType && c.DeletedBy == null && c.IsActive);
    }

    #endregion

    #region Generic approver management

    public async Task<IActionResult> AddApproversAsync(string entityType, Guid entityId, List<ApprovalWriteModel> approvers, string userEmail)
    {
        foreach (var approver in approvers)
        {
            var approval = new Approval
            {
                EntityType = entityType,
                EntityId = entityId,
                ApproverId = approver.ApproverId,
                StageNumber = approver.StageNumber > 0 ? approver.StageNumber : 1,
                Status = ApprovalStatus.Pending,
                Comment = approver.Comment,
                IsActive = true,
                CreatedBy = userEmail,
                CreatedAt = DateTime.UtcNow
            };

            await spaceLinxContext.Approvals.AddAsync(approval);
        }

        await spaceLinxContext.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<IActionResult> UpdateApproversAsync(string entityType, Guid entityId, List<ApprovalWriteModel> updatedApprovals, string userEmail)
    {
        var currentApprovals = await spaceLinxContext.Approvals
            .Where(a => a.EntityType == entityType &&
                        a.EntityId == entityId &&
                        a.DeletedBy == null)
            .ToListAsync();

        var currentApproverIds = currentApprovals.Select(a => a.ApproverId).ToHashSet();
        var updatedApproverIds = updatedApprovals.Select(a => a.ApproverId).ToHashSet();

        // Soft delete removed approvers
        var approvalsToSoftDelete = currentApprovals
            .Where(existing => !updatedApproverIds.Contains(existing.ApproverId))
            .Select(existing =>
            {
                existing.DeletedAt = DateTime.UtcNow;
                existing.DeletedBy = userEmail;
                existing.Status = ApprovalStatus.Removed;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = userEmail;
                return existing;
            })
            .ToList();

        // Add new approvers
        var approvalsToAdd = updatedApprovals
            .Where(newApproval => !currentApproverIds.Contains(newApproval.ApproverId))
            .Select(newApproval => new Approval
            {
                EntityType = entityType,
                EntityId = entityId,
                ApproverId = newApproval.ApproverId,
                StageNumber = newApproval.StageNumber > 0 ? newApproval.StageNumber : 1,
                Status = ApprovalStatus.Pending,
                Comment = newApproval.Comment,
                IsActive = true,
                CreatedBy = userEmail,
                CreatedAt = DateTime.UtcNow
            })
            .ToList();

        // Update existing approvers (stage number changes)
        foreach (var updated in updatedApprovals.Where(u => currentApproverIds.Contains(u.ApproverId)))
        {
            var existing = currentApprovals.First(c => c.ApproverId == updated.ApproverId);
            if (existing.StageNumber != updated.StageNumber)
            {
                existing.StageNumber = updated.StageNumber;
                existing.UpdatedAt = DateTime.UtcNow;
                existing.UpdatedBy = userEmail;
            }
        }

        if (approvalsToSoftDelete.Any())
            spaceLinxContext.Approvals.UpdateRange(approvalsToSoftDelete);

        if (approvalsToAdd.Any())
            await spaceLinxContext.Approvals.AddRangeAsync(approvalsToAdd);

        await spaceLinxContext.SaveChangesAsync();

        return new NoContentResult();
    }

    public async Task<List<ApprovalReadModel>> GetApproversAsync(string entityType, Guid entityId)
    {
        var approvals = await spaceLinxContext.Approvals
            .AsNoTracking()
            .Include(a => a.Approver)
            .Where(a => a.EntityType == entityType &&
                        a.EntityId == entityId &&
                        a.DeletedBy == null &&
                        a.Status != ApprovalStatus.Removed)
            .OrderBy(a => a.StageNumber)
            .ThenBy(a => a.CreatedAt)
            .ToListAsync();

        return mapper.Map<List<ApprovalReadModel>>(approvals);
    }

    #endregion

    #region Approval workflow methods

    public async Task<ApprovalResult> ApproveAsync(string entityType, Guid entityId, string? comment, string userEmail)
    {
        // 1. Get user
        var user = await spaceLinxContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail.ToLower());
        if (user == null)
            return new ApprovalResult { Success = false, ErrorCode = "USER_NOT_FOUND", Message = "User not found" };

        // 2. Get approval record for this user/entity
        var approval = await spaceLinxContext.Approvals
            .FirstOrDefaultAsync(a =>
                a.EntityType == entityType &&
                a.EntityId == entityId &&
                a.ApproverId == user.Id &&
                a.Status == ApprovalStatus.Pending &&
                a.DeletedBy == null);

        if (approval == null)
            return new ApprovalResult { Success = false, ErrorCode = "NOT_AN_APPROVER", Message = "User is not a pending approver for this entity" };

        // 3. Check if can approve current stage (sequential approval check)
        var config = await GetConfigurationAsync(entityType);
        if (config?.RequireSequentialApproval == true)
        {
            var currentStage = await GetCurrentStageAsync(entityType, entityId);
            if (approval.StageNumber != currentStage)
                return new ApprovalResult { Success = false, ErrorCode = "STAGE_NOT_READY", Message = $"Cannot approve yet. Current stage is {currentStage}, your stage is {approval.StageNumber}" };
        }

        // 4. Update approval record
        approval.Status = ApprovalStatus.Approved;
        approval.Comment = comment;
        approval.ActedAt = DateTime.UtcNow;
        approval.UpdatedBy = userEmail;
        approval.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        // 5. Check if all stages are complete
        bool fullyApproved = await AreAllStagesApprovedAsync(entityType, entityId);

        // 6. Log the action
        await LogApprovalActionAsync(
            entityType,
            entityId,
            fullyApproved ? ApprovalAction.FullyApproved : ApprovalAction.StageApproved,
            userEmail,
            approval.StageNumber,
            comment);

        logger.LogInformation("Approval completed for {EntityType} {EntityId} by {UserEmail}. Stage: {Stage}. Fully approved: {FullyApproved}",
            entityType, entityId, userEmail, approval.StageNumber, fullyApproved);

        return new ApprovalResult
        {
            Success = true,
            IsFullyApproved = fullyApproved,
            CurrentStage = await GetCurrentStageAsync(entityType, entityId),
            TotalStages = config?.NumberOfLevels ?? 1,
            Message = fullyApproved ? "All stages approved" : $"Stage {approval.StageNumber} approved"
        };
    }

    public async Task<ApprovalResult> RejectAsync(string entityType, Guid entityId, string? comment, string userEmail)
    {
        // 1. Get user
        var user = await spaceLinxContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail.ToLower());
        if (user == null)
            return new ApprovalResult { Success = false, ErrorCode = "USER_NOT_FOUND", Message = "User not found" };

        // 2. Verify user is an approver (can be pending or already approved at any stage)
        var approval = await spaceLinxContext.Approvals
            .FirstOrDefaultAsync(a =>
                a.EntityType == entityType &&
                a.EntityId == entityId &&
                a.ApproverId == user.Id &&
                (a.Status == ApprovalStatus.Pending || a.Status == ApprovalStatus.Approved) &&
                a.DeletedBy == null);

        if (approval == null)
            return new ApprovalResult { Success = false, ErrorCode = "NOT_AN_APPROVER", Message = "User is not an approver for this entity" };

        // 3. Log the rejection
        await LogApprovalActionAsync(
            entityType,
            entityId,
            ApprovalAction.Rejected,
            userEmail,
            approval.StageNumber,
            comment);

        // 4. Reset all approvals to Pending (per requirements: rejection resets to Draft)
        await ResetApprovalsToPreSubmitAsync(entityType, entityId, userEmail);

        logger.LogInformation("Rejection for {EntityType} {EntityId} by {UserEmail}. All approvals reset to Pending.",
            entityType, entityId, userEmail);

        return new ApprovalResult
        {
            Success = true,
            IsFullyApproved = false,
            CurrentStage = 1,
            Message = "Rejected and reset to draft"
        };
    }

    public async Task ResetApprovalsToPreSubmitAsync(string entityType, Guid entityId, string userEmail)
    {
        var approvals = await spaceLinxContext.Approvals
            .Where(a =>
                a.EntityType == entityType &&
                a.EntityId == entityId &&
                a.DeletedBy == null &&
                a.Status != ApprovalStatus.Removed)
            .ToListAsync();

        foreach (var approval in approvals)
        {
            approval.Status = ApprovalStatus.Pending;
            approval.ActedAt = null;
            approval.Comment = null;
            approval.UpdatedBy = userEmail;
            approval.UpdatedAt = DateTime.UtcNow;
        }

        await spaceLinxContext.SaveChangesAsync();

        await LogApprovalActionAsync(
            entityType,
            entityId,
            ApprovalAction.ResetToDraft,
            userEmail);
    }

    #endregion

    #region Validation methods

    public async Task<bool> IsApproverAsync(string entityType, Guid entityId, string userEmail)
    {
        var user = await spaceLinxContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail.ToLower());
        if (user == null) return false;

        return await spaceLinxContext.Approvals
            .AnyAsync(a =>
                a.EntityType == entityType &&
                a.EntityId == entityId &&
                a.ApproverId == user.Id &&
                a.DeletedBy == null &&
                a.Status != ApprovalStatus.Removed);
    }

    public async Task<bool> AreAllStagesApprovedAsync(string entityType, Guid entityId)
    {
        var approvals = await spaceLinxContext.Approvals
            .Where(a =>
                a.EntityType == entityType &&
                a.EntityId == entityId &&
                a.DeletedBy == null &&
                a.Status != ApprovalStatus.Removed)
            .ToListAsync();

        if (!approvals.Any()) return false;

        return approvals.All(a => a.Status == ApprovalStatus.Approved);
    }

    public async Task<int> GetCurrentStageAsync(string entityType, Guid entityId)
    {
        var pendingApprovals = await spaceLinxContext.Approvals
            .Where(a =>
                a.EntityType == entityType &&
                a.EntityId == entityId &&
                a.DeletedBy == null &&
                a.Status == ApprovalStatus.Pending)
            .ToListAsync();

        if (!pendingApprovals.Any()) return 0; // All approved

        return pendingApprovals.Min(a => a.StageNumber);
    }

    #endregion

    #region Logging

    public async Task LogApprovalActionAsync(string entityType, Guid entityId, string action, string userEmail, int? stageNumber = null, string? notes = null, string? previousStatus = null, string? newStatus = null)
    {
        var log = new ApprovalLog
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            ActionAt = DateTime.UtcNow,
            ActionBy = userEmail,
            StageNumber = stageNumber,
            Notes = notes,
            PreviousStatus = previousStatus,
            NewStatus = newStatus,
            IsActive = true,
            CreatedBy = userEmail,
            CreatedAt = DateTime.UtcNow
        };

        await spaceLinxContext.ApprovalLogs.AddAsync(log);
        await spaceLinxContext.SaveChangesAsync();
    }

    #endregion
}
