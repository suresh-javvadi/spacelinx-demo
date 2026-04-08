using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;
using SystemTask = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Interfaces;

public interface ITenderService
{
    Task<Tender> CreateTenderAsync(TenderCreateModel model);
    Task<Tender> CreateFromRequisitionAsync(Guid requisitionId);
    Task<TenderDetailsReadModel?> GetTenderDetailsAsync(Guid id);
    Task<IActionResult> UpdateTenderAsync(Guid id, TenderUpdateModel model);

    // Line Item Management
    Task<IActionResult> AddLineItemsAsync(Guid tenderId, List<TenderLineItemWriteModel> lineItems);
    Task<IActionResult> UpdateLineItemsAsync(Guid tenderId, List<TenderLineItemWriteModel> lineItems);
    Task<IActionResult> RemoveLineItemAsync(Guid tenderId, Guid lineItemId);

    // Vendor Management
    Task<IActionResult> InviteVendorsAsync(Guid tenderId, List<TenderVendorWriteModel> vendors);
    Task<IActionResult> UpdateVendorStatusAsync(Guid tenderId, Guid vendorId, string status);
    Task<List<TenderVendorReadModel>> GetVendorsAsync(Guid tenderId);

    // Quotation Management
    Task<IActionResult> AddQuotationAsync(Guid tenderId, TenderQuotationWriteModel quotation);
    Task<IActionResult> UpdateQuotationAsync(Guid tenderId, Guid quotationId, TenderQuotationWriteModel quotation);
    Task<TenderQuotationReadModel?> GetQuotationDetailsAsync(Guid quotationId);
    Task<List<TenderQuotationReadModel>> GetQuotationsAsync(Guid tenderId);

    // Lifecycle Actions
    Task<IActionResult> PublishAsync(Guid tenderId);
    Task<IActionResult> CloseAsync(Guid tenderId);
    Task<IActionResult> AwardAsync(Guid tenderId, Guid quotationId);
    Task<IActionResult> CancelAsync(Guid tenderId, string? reason);

    // PO Creation
    Task<PurchaseOrder> CreatePurchaseOrderFromTenderAsync(Guid tenderId);

    // CompanyPart Update
    SystemTask UpdateCompanyPartFromAwardedQuotationAsync(Guid quotationId);

    // Number Generation
    Task<string> GenerateTenderNumberAsync();
}
