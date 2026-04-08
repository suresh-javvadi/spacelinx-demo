using AutoMapper;
using Microsoft.AspNetCore.Authorization;
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
public class TenderController(
    SpaceLinxContext spaceLinxContext,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    ITenderService tenderService,
    ITenderApprovalService tenderApprovalService) :
    GenericRestController<Tender, TenderWriteModel, TenderUpdateModel, TenderReadModel, TenderRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetTenderDetails(Guid id)
    {
        var tender = await tenderService.GetTenderDetailsAsync(id);
        if (tender == null)
            return NotFound("Tender not found");
        return Ok(tender);
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetByStatus([FromQuery] string status)
    {
        var tenders = await spaceLinxContext.Tenders
            .Include(t => t.Project)
            .Include(t => t.Buyer)
            .Where(t => t.Status == status && t.DeletedBy == null)
            .ToListAsync();

        return Ok(mapper.Map<List<TenderReadModel>>(tenders));
    }

    [HttpPost("tender-details")]
    public async Task<IActionResult> CreateTenderWithDetails([FromBody] TenderCreateModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var tender = await tenderService.CreateTenderAsync(model);
        return Ok(mapper.Map<TenderReadModel>(tender));
    }

    [HttpPost("from-requisition/{requisitionId}")]
    public async Task<IActionResult> CreateFromRequisition(Guid requisitionId)
    {
        try
        {
            var tender = await tenderService.CreateFromRequisitionAsync(requisitionId);
            return Ok(mapper.Map<TenderReadModel>(tender));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("tender-details-update/{id}")]
    public async Task<IActionResult> UpdateTenderDetails(Guid id, [FromBody] TenderUpdateModel model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        return await tenderService.UpdateTenderAsync(id, model);
    }

    // Line Item Management
    [HttpPost("{id}/line-items")]
    public async Task<IActionResult> AddLineItems(Guid id, [FromBody] List<TenderLineItemWriteModel> lineItems)
    {
        return await tenderService.AddLineItemsAsync(id, lineItems);
    }

    [HttpPut("{id}/line-items")]
    public async Task<IActionResult> UpdateLineItems(Guid id, [FromBody] List<TenderLineItemWriteModel> lineItems)
    {
        return await tenderService.UpdateLineItemsAsync(id, lineItems);
    }

    [HttpDelete("{id}/line-items/{lineItemId}")]
    public async Task<IActionResult> RemoveLineItem(Guid id, Guid lineItemId)
    {
        return await tenderService.RemoveLineItemAsync(id, lineItemId);
    }

    // Vendor Management
    [HttpPost("{id}/vendors")]
    public async Task<IActionResult> InviteVendors(Guid id, [FromBody] List<TenderVendorWriteModel> vendors)
    {
        return await tenderService.InviteVendorsAsync(id, vendors);
    }

    [HttpGet("{id}/vendors")]
    public async Task<IActionResult> GetVendors(Guid id)
    {
        var vendors = await tenderService.GetVendorsAsync(id);
        return Ok(vendors);
    }

    [HttpPut("{id}/vendors/{vendorId}/status")]
    public async Task<IActionResult> UpdateVendorStatus(Guid id, Guid vendorId, [FromQuery] string status)
    {
        return await tenderService.UpdateVendorStatusAsync(id, vendorId, status);
    }

    // Quotation Management
    [HttpPost("{id}/quotations")]
    public async Task<IActionResult> AddQuotation(Guid id, [FromBody] TenderQuotationWriteModel quotation)
    {
        return await tenderService.AddQuotationAsync(id, quotation);
    }

    [HttpGet("{id}/quotations")]
    public async Task<IActionResult> GetQuotations(Guid id)
    {
        var quotations = await tenderService.GetQuotationsAsync(id);
        return Ok(quotations);
    }

    [HttpGet("{id}/quotations/{quotationId}/details")]
    public async Task<IActionResult> GetQuotationDetails(Guid id, Guid quotationId)
    {
        var quotation = await tenderService.GetQuotationDetailsAsync(quotationId);
        if (quotation == null)
            return NotFound("Quotation not found");
        return Ok(quotation);
    }

    [HttpPut("{id}/quotations/{quotationId}")]
    public async Task<IActionResult> UpdateQuotation(Guid id, Guid quotationId, [FromBody] TenderQuotationWriteModel quotation)
    {
        return await tenderService.UpdateQuotationAsync(id, quotationId, quotation);
    }

    // Lifecycle Actions
    [HttpPut("close/{id}")]
    public async Task<IActionResult> CloseTender(Guid id)
    {
        return await tenderService.CloseAsync(id);
    }

    [HttpPut("award/{id}")]
    public async Task<IActionResult> AwardTender(Guid id, [FromQuery] Guid quotationId)
    {
        return await tenderService.AwardAsync(id, quotationId);
    }

    [HttpPut("cancel/{id}")]
    public async Task<IActionResult> CancelTender(Guid id, [FromQuery] string? reason)
    {
        return await tenderService.CancelAsync(id, reason);
    }

    [HttpPost("{id}/create-purchase-order")]
    public async Task<IActionResult> CreatePurchaseOrder(Guid id)
    {
        try
        {
            var po = await tenderService.CreatePurchaseOrderFromTenderAsync(id);
            return Ok(new { PurchaseOrderId = po.Id, Number = po.Number });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    // Approval Endpoints
    [HttpPost("{id}/approvers")]
    public async Task<IActionResult> AddApprovers(Guid id, [FromBody] List<ApprovalWriteModel> approvers)
    {
        return await tenderApprovalService.AddApproversAsync(id, approvers);
    }

    [HttpPut("{id}/approvers")]
    public async Task<IActionResult> UpdateApprovers(Guid id, [FromBody] List<ApprovalWriteModel> approvers)
    {
        return await tenderApprovalService.UpdateApproversAsync(id, approvers);
    }

    [HttpGet("{id}/approval-history")]
    public async Task<IActionResult> GetApprovalHistory(Guid id)
    {
        var history = await tenderApprovalService.GetApprovalHistoryAsync(id);
        return Ok(history);
    }

    [HttpPost("{id}/notification-recipients")]
    public async Task<IActionResult> AddNotificationRecipients(Guid id, [FromBody] List<ApprovalNotificationRecipientWriteModel> recipients)
    {
        return await tenderApprovalService.AddNotificationRecipientsAsync(id, recipients);
    }

    [HttpPut("submit/{id}")]
    public async Task<IActionResult> SubmitForApproval(Guid id)
    {
        return await tenderApprovalService.SubmitForApprovalAsync(id);
    }

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(Guid id, [FromQuery] string? comment)
    {
        return await tenderApprovalService.ApproveAsync(id, comment);
    }

    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(Guid id, [FromQuery] string? comment)
    {
        return await tenderApprovalService.RejectAsync(id, comment);
    }
}
