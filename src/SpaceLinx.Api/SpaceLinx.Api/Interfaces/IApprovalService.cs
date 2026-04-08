using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Interfaces;

public interface IApprovalService
{
    // Legacy ECO-specific methods (for backward compatibility)
    Task<IActionResult> UpdateEcoApproversAsync(Guid ecoEntityId, List<ApprovalWriteModel> updatedApprovals);
    Task<IActionResult> AddEcoApproversAsync(Guid ecoEntityId, List<ApprovalWriteModel> approvers, string userEmail);

    // Configuration methods
    Task<ApprovalConfiguration?> GetConfigurationAsync(string entityType);

    // Generic approver management
    Task<IActionResult> AddApproversAsync(string entityType, Guid entityId, List<ApprovalWriteModel> approvers, string userEmail);
    Task<IActionResult> UpdateApproversAsync(string entityType, Guid entityId, List<ApprovalWriteModel> updatedApprovals, string userEmail);
    Task<List<ApprovalReadModel>> GetApproversAsync(string entityType, Guid entityId);

    // Approval workflow methods
    Task<ApprovalResult> ApproveAsync(string entityType, Guid entityId, string? comment, string userEmail);
    Task<ApprovalResult> RejectAsync(string entityType, Guid entityId, string? comment, string userEmail);
    Task ResetApprovalsToPreSubmitAsync(string entityType, Guid entityId, string userEmail);

    // Validation methods
    Task<bool> IsApproverAsync(string entityType, Guid entityId, string userEmail);
    Task<bool> AreAllStagesApprovedAsync(string entityType, Guid entityId);
    Task<int> GetCurrentStageAsync(string entityType, Guid entityId);

    // Logging
    Task LogApprovalActionAsync(string entityType, Guid entityId, string action, string userEmail, int? stageNumber = null, string? notes = null, string? previousStatus = null, string? newStatus = null);
}

public class ApprovalResult
{
    public bool Success { get; set; }
    public bool IsFullyApproved { get; set; }
    public int CurrentStage { get; set; }
    public int TotalStages { get; set; }
    public string? Message { get; set; }
    public string? ErrorCode { get; set; }
}
