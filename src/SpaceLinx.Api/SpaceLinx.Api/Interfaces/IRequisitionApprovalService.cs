using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IRequisitionApprovalService
{
    Task<IActionResult> SubmitForApprovalAsync(Guid requisitionId);
    Task<IActionResult> ApproveAsync(Guid requisitionId, string? comment);
    Task<IActionResult> RejectAsync(Guid requisitionId, string? comment);
    Task<IActionResult> AddApproversAsync(Guid requisitionId, List<ApprovalWriteModel> approvers);
    Task<IActionResult> UpdateApproversAsync(Guid requisitionId, List<ApprovalWriteModel> approvers);
    Task<List<ApprovalReadModel>> GetApprovalHistoryAsync(Guid requisitionId);
    Task<IActionResult> AddNotificationRecipientsAsync(Guid requisitionId, List<ApprovalNotificationRecipientWriteModel> recipients);
}
