namespace SpaceLinx.Api.Interfaces;

public interface IApprovalNotificationService
{
    Task NotifySubmittedAsync(string entityType, Guid entityId);
    Task NotifyStageApprovedAsync(string entityType, Guid entityId, int stageNumber, string approverEmail);
    Task NotifyFullyApprovedAsync(string entityType, Guid entityId);
    Task NotifyRejectedAsync(string entityType, Guid entityId, string rejectorEmail, string? notes);
}
