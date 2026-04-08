using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface ITenderApprovalService
{
    Task<IActionResult> SubmitForApprovalAsync(Guid tenderId);
    Task<IActionResult> ApproveAsync(Guid tenderId, string? comment);
    Task<IActionResult> RejectAsync(Guid tenderId, string? comment);
    Task<IActionResult> AddApproversAsync(Guid tenderId, List<ApprovalWriteModel> approvers);
    Task<IActionResult> UpdateApproversAsync(Guid tenderId, List<ApprovalWriteModel> approvers);
    Task<List<ApprovalReadModel>> GetApprovalHistoryAsync(Guid tenderId);
    Task<IActionResult> AddNotificationRecipientsAsync(Guid tenderId, List<ApprovalNotificationRecipientWriteModel> recipients);
}
