using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IPurchaseOrderApprovalService
{
    Task<IActionResult> SubmitForApprovalAsync(Guid poId);
    Task<IActionResult> ApproveAsync(Guid poId, string? comment);
    Task<IActionResult> RejectAsync(Guid poId, string? comment);
    Task<IActionResult> AddApproversAsync(Guid poId, List<ApprovalWriteModel> approvers);
    Task<IActionResult> UpdateApproversAsync(Guid poId, List<ApprovalWriteModel> approvers);
    Task<List<ApprovalReadModel>> GetApprovalHistoryAsync(Guid poId);
    Task<IActionResult> AddNotificationRecipientsAsync(Guid poId, List<ApprovalNotificationRecipientWriteModel> recipients);
    Task<List<PurchaseOrdersVw>> GetMyApprovalsAsync();
}
