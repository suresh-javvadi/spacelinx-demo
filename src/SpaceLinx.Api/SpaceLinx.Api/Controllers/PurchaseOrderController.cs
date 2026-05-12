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
public class PurchaseOrderController(
    SpaceLinxContext spaceLinxContext,
    IMapper mapper,
    IHttpContextAccessor httpContextAccessor,
    IDocumentService documentService,
    IPurchaseOrderApprovalService purchaseOrderApprovalService) :
    GenericRestController<PurchaseOrder, PurchaseOrderWriteModel, PurchaseOrderUpdateModel, PurchaseOrderReadModel, PurchaseOrderRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet]
    public override async Task<List<PurchaseOrderReadModel>> Get()
    {
        var departmentId = HttpContext.Request.Query.TryGetValue("departmentId", out var depIdRaw)
            && Guid.TryParse(depIdRaw, out var parsed) ? parsed : (Guid?)null;
        var allDepartments = HttpContext.Request.Query.TryGetValue("allDepartments", out var allRaw)
            && bool.TryParse(allRaw, out var parsedAll) && parsedAll;

        Guid? scopedDeptId = departmentId;
        if (scopedDeptId == null && !allDepartments)
        {
            scopedDeptId = await spaceLinxContext.Users
                .AsNoTracking()
                .Where(u => u.Email == UserEmail && u.DeletedBy == null)
                .Select(u => u.DepartmentId)
                .FirstOrDefaultAsync();
        }

        var query = spaceLinxContext.PurchaseOrders
            .AsNoTracking()
            .Include(x => x.Buyer)
            .Include(x => x.SupplyChainLead)
            .Include(x => x.Company)
            .Include(x => x.Currency)
            .Include(x => x.PaymentTerm)
            .Include(x => x.Project)
            .Include(x => x.Requisition)
            .Include(x => x.BillingAddress)
            .Include(x => x.DeliveryAddress)
            .Include(x => x.ShippingAddress)
            .Include(x => x.VendorBillingAddress)
            .Include(x => x.VendorBillingContact)
            .Include(x => x.Department)
            .Where(x => x.DeletedBy == null);

        if (scopedDeptId.HasValue)
        {
            query = query.Where(x => x.DepartmentId == scopedDeptId);
        }

        var records = await query.ToListAsync();
        return mapper.Map<List<PurchaseOrderReadModel>>(records);
    }

    [HttpGet("purchase-order")]
    public async Task<IActionResult> GetPurchaseOrders()
    {
        var departmentId = HttpContext.Request.Query.TryGetValue("departmentId", out var depIdRaw)
            && Guid.TryParse(depIdRaw, out var parsed) ? parsed : (Guid?)null;
        var allDepartments = HttpContext.Request.Query.TryGetValue("allDepartments", out var allRaw)
            && bool.TryParse(allRaw, out var parsedAll) && parsedAll;

        Guid? scopedDeptId = departmentId;
        if (scopedDeptId == null && !allDepartments)
        {
            scopedDeptId = await spaceLinxContext.Users
                .AsNoTracking()
                .Where(u => u.Email == UserEmail && u.DeletedBy == null)
                .Select(u => u.DepartmentId)
                .FirstOrDefaultAsync();
        }

        var query = spaceLinxContext.PurchaseOrdersVws.AsNoTracking();

        if (scopedDeptId.HasValue)
        {
            var allowedIds = spaceLinxContext.PurchaseOrders
                .Where(x => x.DepartmentId == scopedDeptId && x.DeletedBy == null)
                .Select(x => x.Id);
            query = query.Where(x => allowedIds.Contains(x.Id));
        }

        var result = await query.ToListAsync();
        return Ok(result);
    }

    [HttpGet("Status")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var records = await spaceLinxContext.PurchaseOrders
            .AsNoTracking()
            .Where(x => x.Status == status && x.DeletedBy == null)
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var record = await spaceLinxContext.PurchaseOrders
            .AsNoTracking()
            .Include(x => x.PoLineItems)
            .ThenInclude(x => x.Part)
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        var purchaseOrder = mapper.Map<PurchaseOrderDetailsReadModel>(record);

        if (purchaseOrder != null)
        {
            purchaseOrder.DocumentUrl = await spaceLinxContext.Documents
                .Where(doc => doc.EntityId == purchaseOrder.Id && doc.DeletedBy == null)
                .Select(doc => doc.FilePath)
                .FirstOrDefaultAsync();
        }

        purchaseOrder.Approvals = await purchaseOrderApprovalService.GetApprovalHistoryAsync(id);

        return Ok(purchaseOrder);
    }

    [HttpPost("purchase-order-details")]
    public async Task<IActionResult> CreatePurchaseOrder([FromForm] PurchaseOrderCreateModel purchaseOrderDetails)
    {
        using (var transaction = await spaceLinxContext.Database.BeginTransactionAsync())
        {
            try
            {
                var discountType = NormalizeDiscountType(purchaseOrderDetails.DiscountType);

                var subtotal = purchaseOrderDetails.PoLineItems?.Sum(x => x.TotalPrice ?? 0) ?? 0;

                var poValid = ValidateDiscount(purchaseOrderDetails.Discount, discountType, subtotal, "PO");

                if (poValid != null)
                {
                    return poValid;
                }

                if (purchaseOrderDetails.PoLineItems != null && purchaseOrderDetails.PoLineItems.Any())
                {
                    foreach (var lineItem in purchaseOrderDetails.PoLineItems)
                    {
                        var lineDiscountType = NormalizeDiscountType(lineItem.DiscountType);

                        var result = ValidateDiscount(lineItem.Discount, lineDiscountType, lineItem.TotalPrice ?? 0, $"Line item (PartId: {lineItem.PartId})");
                        if (result != null)
                        {
                            return result;
                        }
                    }
                }

                var purchaseOrder = new PurchaseOrder
                {
                    CompanyId = purchaseOrderDetails.CompanyId,
                    ProjectId = purchaseOrderDetails.ProjectId,
                    PoType = purchaseOrderDetails.PoType,
                    BuyerId = purchaseOrderDetails.BuyerId,
                    SupplyChainLeadId = purchaseOrderDetails.SupplyChainLeadId,
                    RequisitionId = purchaseOrderDetails.RequisitionId,
                    PaymentTermId = purchaseOrderDetails.PaymentTermId,
                    CurrencyId = purchaseOrderDetails.CurrencyId,
                    OrderDate = purchaseOrderDetails.OrderDate,
                    ActualDeliveryDate = purchaseOrderDetails.ActualDeliveryDate,
                    ExpectedDeliveryDate = purchaseOrderDetails.ExpectedDeliveryDate,
                    Discount = purchaseOrderDetails.Discount,
                    DiscountType = discountType,
                    TaxOption = purchaseOrderDetails.TaxOption,
                    TotalAmount = purchaseOrderDetails.TotalAmount,
                    QuotationReferenceNumber = purchaseOrderDetails.QuotationReferenceNumber,
                    ShipmentReferenceNumber = purchaseOrderDetails.ShipmentReferenceNumber,
                    RevisionHistory = purchaseOrderDetails.RevisionHistory,
                    RoundOff = purchaseOrderDetails.RoundOff.HasValue? Math.Round(purchaseOrderDetails.RoundOff.Value, 4): (decimal?)null,
                    BillingAddressId = purchaseOrderDetails.BillingAddressId,
                    DeliveryAddressId = purchaseOrderDetails.DeliveryAddressId,
                    ShippingAddressId = purchaseOrderDetails.ShippingAddressId,
                    VendorBillingAddressId = purchaseOrderDetails.VendorBillingAddressId,
                    VendorBillingContactId = purchaseOrderDetails.VendorBillingContactId,
                    DeliveryStatus = purchaseOrderDetails.DeliveryStatus,
                    QuotationReferenceId = purchaseOrderDetails.QuotationReferenceId,
                    PoTerms = purchaseOrderDetails.PoTerms,
                    Description = purchaseOrderDetails.Description,
                    CustomerInstructions = purchaseOrderDetails.CustomerInstructions,
                    DeliveryTerms = purchaseOrderDetails.DeliveryTerms,
                    TermsAndConditions = purchaseOrderDetails.TermsAndConditions,
                    ApprovedBy = purchaseOrderDetails.ApprovedBy,
                    ApprovedDate = purchaseOrderDetails.ApprovedDate,
                    DepartmentId = purchaseOrderDetails.DepartmentId,
                    IsActive = true,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow
                };

                if (purchaseOrder.DepartmentId == null && purchaseOrderDetails.BuyerId.HasValue)
                {
                    purchaseOrder.DepartmentId = await spaceLinxContext.Users
                        .Where(u => u.Id == purchaseOrderDetails.BuyerId && u.DeletedBy == null)
                        .Select(u => u.DepartmentId)
                        .FirstOrDefaultAsync();
                }

                spaceLinxContext.PurchaseOrders.Add(purchaseOrder);
                await spaceLinxContext.SaveChangesAsync();

                if (purchaseOrderDetails.RequisitionId.HasValue)
                {
                    var requisition = await spaceLinxContext.Requisitions
                        .FirstOrDefaultAsync(r => r.Id == purchaseOrderDetails.RequisitionId && r.DeletedBy == null);

                    if (requisition != null)
                    {
                        requisition.Status = RequisitionStatus.PoCreated;
                        requisition.UpdatedBy = UserEmail;
                        requisition.UpdatedAt = DateTime.UtcNow;

                        spaceLinxContext.Requisitions.Update(requisition);
                        await spaceLinxContext.SaveChangesAsync();
                    }
                }

                if (purchaseOrderDetails.PoLineItems != null && purchaseOrderDetails.PoLineItems.Any())
                {
                    var invalidLineItem = purchaseOrderDetails.PoLineItems.FirstOrDefault(li => li.OrderedQuantity < 1);
                    if (invalidLineItem != null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest(new { Message = $"Line item quantity must be at least 1 for part_id ({invalidLineItem.PartId})" });
                    }

                    foreach (var lineItem in purchaseOrderDetails.PoLineItems)
                    {
                        var poLineItem = new PoLineItem
                        {
                            PurchaseOrderId = purchaseOrder.Id.Value,
                            PartId = lineItem.PartId,
                            OrderedQuantity = lineItem.OrderedQuantity,
                            ReceivedQuantity = lineItem.ReceivedQuantity,
                            PendingQuantity = lineItem.PendingQuantity,
                            UnitPrice = lineItem.UnitPrice,
                            ConversionRate = lineItem.ConversionRate,
                            Currency = lineItem.Currency,
                            TotalPrice = lineItem.TotalPrice,
                            Tax = lineItem.Tax,
                            TaxType = lineItem.TaxType,
                            Description = lineItem.Description,
                            Hsn = lineItem.Hsn,
                            ActualDeliveryDate = lineItem.ActualDeliveryDate,
                            ExpectedDeliveryDate = lineItem.ExpectedDeliveryDate,
                            Discount = lineItem.Discount,
                            DiscountType = NormalizeDiscountType(lineItem.DiscountType),
                            IsActive = true,
                            CreatedBy = UserEmail,
                            CreatedAt = DateTime.UtcNow
                        };

                        spaceLinxContext.PoLineItems.Add(poLineItem);

                        var existingVendorPart = await spaceLinxContext.CompanyParts.FirstOrDefaultAsync(vp => vp.CompanyId == purchaseOrderDetails.CompanyId && vp.PartId == lineItem.PartId && vp.DeletedBy == null);

                        if (existingVendorPart == null)
                        {
                            var vendorPart = new CompanyPart
                            {
                                Id = Guid.NewGuid(),
                                CompanyId = purchaseOrderDetails.CompanyId,
                                PartId = lineItem.PartId.Value,
                                IsActive = true,
                                CreatedAt = DateTime.UtcNow,
                                CreatedBy = UserEmail
                            };

                            await spaceLinxContext.CompanyParts.AddAsync(vendorPart);
                        }
                    }

                    await spaceLinxContext.SaveChangesAsync();
                }

                if (purchaseOrderDetails.DocumentFiles != null && purchaseOrderDetails.DocumentFiles.Any())
                {
                    foreach (var doc in purchaseOrderDetails.DocumentFiles)
                    {
                        doc.EntityId = purchaseOrder.Id!.Value;
                        doc.EntityType = SpaceLinxEntities.PurchaseOrder;

                        await documentService.SaveDocumentAsync(doc);
                    }
                }

                await transaction.CommitAsync();

                return Ok(new { Message = "Purchase Order created successfully", PurchaseOrderId = purchaseOrder.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    [HttpPut("purchase-order-update/{id}")]
    public async Task<IActionResult> UpdatePurchaseOrder(Guid id, [FromForm] PurchaseOrderAlterModel purchaseOrderDetails, [FromForm] IEnumerable<DocumentCreateModel> documents)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var poRecord = await spaceLinxContext.PurchaseOrders
                .Include(x => x.PoLineItems)
                .FirstOrDefaultAsync(po => po.Id == id && po.DeletedBy == null);

            if (poRecord == null)
            {
                return NotFound();
            }

            if (poRecord.Status == PoStatus.Closed || poRecord.Status == PoStatus.Cancelled)
            {
                return BadRequest($"Cannot edit a Purchase Order in {poRecord.Status} status");
            }

            var discountType = NormalizeDiscountType(purchaseOrderDetails.DiscountType);

            var subtotal = purchaseOrderDetails.PoLineItems?.Sum(x => x.TotalPrice ?? 0) ?? 0;

            var poValid = ValidateDiscount(purchaseOrderDetails.Discount, discountType, subtotal, "PO");

            if (poValid != null)
            {
                return poValid;
            }

            if (purchaseOrderDetails.PoLineItems != null && purchaseOrderDetails.PoLineItems.Any())
            {
                foreach (var item in purchaseOrderDetails.PoLineItems)
                {
                    var lineDiscountType = NormalizeDiscountType(item.DiscountType);

                    var result = ValidateDiscount(item.Discount, lineDiscountType, item.TotalPrice ?? 0, $"Line item (PartId: {item.PartId})");

                    if (result != null)
                    {
                        return result;
                    }
                }
            }

            poRecord.CompanyId = purchaseOrderDetails.CompanyId;
            poRecord.ProjectId = purchaseOrderDetails.ProjectId;
            poRecord.PoType = purchaseOrderDetails.PoType;
            poRecord.BuyerId = purchaseOrderDetails.BuyerId;
            poRecord.SupplyChainLeadId = purchaseOrderDetails.SupplyChainLeadId;
            poRecord.RequisitionId = purchaseOrderDetails.RequisitionId;
            poRecord.PaymentTermId = purchaseOrderDetails.PaymentTermId;
            poRecord.CurrencyId = purchaseOrderDetails.CurrencyId;
            poRecord.OrderDate = purchaseOrderDetails.OrderDate;
            poRecord.ActualDeliveryDate = purchaseOrderDetails.ActualDeliveryDate;
            poRecord.ExpectedDeliveryDate = purchaseOrderDetails.ExpectedDeliveryDate;
            poRecord.Discount = purchaseOrderDetails.Discount;
            poRecord.DiscountType = discountType;
            poRecord.TaxOption = purchaseOrderDetails.TaxOption;
            poRecord.TotalAmount = purchaseOrderDetails.TotalAmount;
            poRecord.QuotationReferenceNumber = purchaseOrderDetails.QuotationReferenceNumber;
            poRecord.ShipmentReferenceNumber = purchaseOrderDetails.ShipmentReferenceNumber;
            poRecord.RevisionHistory = purchaseOrderDetails.RevisionHistory;
            poRecord.RoundOff = purchaseOrderDetails.RoundOff.HasValue ? Math.Round(purchaseOrderDetails.RoundOff.Value, 4) : (decimal?)null;
            poRecord.BillingAddressId = purchaseOrderDetails.BillingAddressId;
            poRecord.DeliveryAddressId = purchaseOrderDetails.DeliveryAddressId;
            poRecord.ShippingAddressId = purchaseOrderDetails.ShippingAddressId;
            poRecord.VendorBillingAddressId = purchaseOrderDetails.VendorBillingAddressId;
            poRecord.VendorBillingContactId = purchaseOrderDetails.VendorBillingContactId;
            poRecord.DeliveryStatus = purchaseOrderDetails.DeliveryStatus;
            poRecord.QuotationReferenceId = purchaseOrderDetails.QuotationReferenceId;
            poRecord.PoTerms = purchaseOrderDetails.PoTerms;
            poRecord.Description = purchaseOrderDetails.Description;
            poRecord.CustomerInstructions = purchaseOrderDetails.CustomerInstructions;
            poRecord.DeliveryTerms = purchaseOrderDetails.DeliveryTerms;
            poRecord.TermsAndConditions = purchaseOrderDetails.TermsAndConditions;
            poRecord.ApprovedBy = purchaseOrderDetails.ApprovedBy;
            poRecord.ApprovedDate = purchaseOrderDetails.ApprovedDate;
            poRecord.UpdatedBy = UserEmail;
            poRecord.UpdatedAt = DateTime.UtcNow;

            spaceLinxContext.PurchaseOrders.Update(poRecord);
            await spaceLinxContext.SaveChangesAsync();

            var incomingLineItems = purchaseOrderDetails.PoLineItems?.ToList()
                ?? new List<PoLineItemAlterModel>();

            var incomingItemIds = incomingLineItems
                .Where(item => item.Id.HasValue && item.Id != Guid.Empty)
                .Select(item => item.Id!.Value)
                .ToHashSet();

            var existingLineItems = poRecord.PoLineItems.ToList();

            var orphanedLineItems = existingLineItems
                .Where(x => !incomingItemIds.Contains(x.Id.Value))
                .ToList();

            if (orphanedLineItems.Any())
                spaceLinxContext.PoLineItems.RemoveRange(orphanedLineItems);

            if (purchaseOrderDetails.PoLineItems != null && purchaseOrderDetails.PoLineItems.Any())
            {
                var invalidLineItem = purchaseOrderDetails.PoLineItems.FirstOrDefault(item => item.OrderedQuantity < 1);
                if (invalidLineItem != null)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { Message = $"Line item quantity must be at least 1 for part_id ({invalidLineItem.PartId})" });
                }

                foreach (var item in purchaseOrderDetails.PoLineItems)
                {
                    var existingLineItem = await spaceLinxContext.PoLineItems
                        .FirstOrDefaultAsync(li => li.Id == item.Id && li.PurchaseOrderId == poRecord.Id && li.DeletedBy == null);

                    if (existingLineItem == null)
                    {
                        var newLineItem = new PoLineItem
                        {
                            PurchaseOrderId = poRecord.Id.Value,
                            PartId = item.PartId,
                            OrderedQuantity = item.OrderedQuantity,
                            ReceivedQuantity = item.ReceivedQuantity,
                            PendingQuantity = item.PendingQuantity,
                            UnitPrice = item.UnitPrice,
                            ConversionRate = item.ConversionRate,
                            Currency = item.Currency,
                            TotalPrice = item.TotalPrice,
                            Tax = item.Tax,
                            TaxType = item.TaxType,
                            Description = item.Description,
                            Hsn = item.Hsn,
                            ActualDeliveryDate = item.ActualDeliveryDate,
                            ExpectedDeliveryDate = item.ExpectedDeliveryDate,
                            Discount = item.Discount,
                            DiscountType = NormalizeDiscountType(item.DiscountType),
                            IsActive = true,
                            CreatedBy = UserEmail,
                            CreatedAt = DateTime.UtcNow
                        };

                        await spaceLinxContext.PoLineItems.AddAsync(newLineItem);
                        await spaceLinxContext.SaveChangesAsync();
                    }
                    else
                    {
                        existingLineItem.OrderedQuantity = item.OrderedQuantity;
                        existingLineItem.ReceivedQuantity = item.ReceivedQuantity;
                        existingLineItem.PendingQuantity = item.PendingQuantity;
                        existingLineItem.UnitPrice = item.UnitPrice;
                        existingLineItem.ConversionRate = item.ConversionRate;
                        existingLineItem.Currency = item.Currency;
                        existingLineItem.TotalPrice = item.TotalPrice;
                        existingLineItem.Tax = item.Tax;
                        existingLineItem.TaxType = item.TaxType;
                        existingLineItem.Description = item.Description;
                        existingLineItem.Hsn = item.Hsn;
                        existingLineItem.ActualDeliveryDate = item.ActualDeliveryDate;
                        existingLineItem.ExpectedDeliveryDate = item.ExpectedDeliveryDate;
                        existingLineItem.Discount = item.Discount;
                        existingLineItem.DiscountType = NormalizeDiscountType(item.DiscountType);
                        existingLineItem.UpdatedBy = UserEmail;
                        existingLineItem.UpdatedAt = DateTime.UtcNow;

                        spaceLinxContext.PoLineItems.Update(existingLineItem);
                        await spaceLinxContext.SaveChangesAsync();
                    }
                }
            }

            if (purchaseOrderDetails.Approvals != null && purchaseOrderDetails.Approvals.Any())
            {
                await purchaseOrderApprovalService.UpdateApproversAsync(id, purchaseOrderDetails.Approvals);
            }

            if (documents != null && documents.Any())
            {
                foreach (var doc in documents)
                {
                    doc.EntityId = id;
                    doc.EntityType = SpaceLinxEntities.PurchaseOrder;

                    var document = await documentService.SaveDocumentAsync(doc);
                    poRecord.QuotationReferenceId = document.Id.Value;
                }
            }

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"An error occurred: {ex.Message}");
        }
    }

    #region Multi-Level Approval Endpoints

    [HttpPost("{id}/approvers")]
    public async Task<IActionResult> AddApprovers(Guid id, [FromBody] List<ApprovalWriteModel> approvers)
    {
        return await purchaseOrderApprovalService.AddApproversAsync(id, approvers);
    }

    [HttpPut("{id}/approvers")]
    public async Task<IActionResult> UpdateApprovers(Guid id, [FromBody] List<ApprovalWriteModel> approvers)
    {
        return await purchaseOrderApprovalService.UpdateApproversAsync(id, approvers);
    }

    [HttpGet("{id}/approval-history")]
    public async Task<IActionResult> GetApprovalHistory(Guid id)
    {
        var result = await purchaseOrderApprovalService.GetApprovalHistoryAsync(id);
        return Ok(result);
    }

    [HttpPost("{id}/notification-recipients")]
    public async Task<IActionResult> AddNotificationRecipients(Guid id, [FromBody] List<ApprovalNotificationRecipientWriteModel> recipients)
    {
        return await purchaseOrderApprovalService.AddNotificationRecipientsAsync(id, recipients);
    }

    [HttpPut("submit/{id}")]
    public async Task<IActionResult> Submit(Guid id)
    {
        return await purchaseOrderApprovalService.SubmitForApprovalAsync(id);
    }

    [HttpPut("approve/{id}")]
    public async Task<IActionResult> Approve(Guid id, [FromQuery] string? comment = null)
    {
        return await purchaseOrderApprovalService.ApproveAsync(id, comment);
    }

    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(Guid id, [FromQuery] string? comment = null)
    {
        return await purchaseOrderApprovalService.RejectAsync(id, comment);
    }

    #endregion

    [HttpPut("close/{id}")]
    public async Task<IActionResult> Close(Guid id)
    {
        var record = await spaceLinxContext.PurchaseOrders
                  .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        record.Status = PoStatus.Closed;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    #region Zoho Export

    /// <summary>
    /// Export a single Purchase Order in Zoho Books CSV format
    /// </summary>
    [HttpGet("{id}/export/zoho-csv")]
    public async Task<IActionResult> ExportToZohoCsv(Guid id)
    {
        var purchaseOrder = await spaceLinxContext.PurchaseOrders
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Currency)
            .Include(x => x.PaymentTerm)
            .Include(x => x.Project)
            .Include(x => x.VendorBillingContact)
            .Include(x => x.PoLineItems)
                .ThenInclude(x => x.Part)
                    .ThenInclude(p => p!.UnitOfMeasure)
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (purchaseOrder == null)
        {
            return NotFound();
        }

        var csvRows = BuildZohoCsvRows(purchaseOrder);
        var csvContent = GenerateCsvContent(csvRows);

        var fileName = $"PO_{purchaseOrder.Number}_{DateTime.UtcNow:yyyyMMdd}.csv";
        return File(System.Text.Encoding.UTF8.GetBytes(csvContent), "text/csv", fileName);
    }

    /// <summary>
    /// Export multiple Purchase Orders in Zoho Books CSV format
    /// </summary>
    [HttpGet("export/zoho-csv")]
    public async Task<IActionResult> ExportMultipleToZohoCsv([FromQuery] List<Guid>? ids = null, [FromQuery] string? status = null)
    {
        var query = spaceLinxContext.PurchaseOrders
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Currency)
            .Include(x => x.PaymentTerm)
            .Include(x => x.Project)
            .Include(x => x.VendorBillingContact)
            .Include(x => x.PoLineItems)
                .ThenInclude(x => x.Part)
                    .ThenInclude(p => p!.UnitOfMeasure)
            .Where(x => x.DeletedBy == null);

        if (ids != null && ids.Any())
        {
            query = query.Where(x => ids.Contains(x.Id!.Value));
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(x => x.Status == status);
        }

        var purchaseOrders = await query.ToListAsync();

        if (!purchaseOrders.Any())
        {
            return NotFound("No purchase orders found matching the criteria");
        }

        var allCsvRows = new List<ZohoPurchaseOrderExportModel>();
        foreach (var po in purchaseOrders)
        {
            allCsvRows.AddRange(BuildZohoCsvRows(po));
        }

        var csvContent = GenerateCsvContent(allCsvRows);

        var fileName = $"PurchaseOrders_Zoho_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(System.Text.Encoding.UTF8.GetBytes(csvContent), "text/csv", fileName);
    }

    [HttpPost("export/zoho-csv-multiple")]
    public async Task<IActionResult> ExportZohoCsvJson([FromBody] ZohoExportRequestModel request)
    {
        var ids = request.Ids;

        var query = spaceLinxContext.PurchaseOrders
            .AsNoTracking()
            .Include(x => x.Company)
            .Include(x => x.Currency)
            .Include(x => x.PaymentTerm)
            .Include(x => x.Project)
            .Include(x => x.VendorBillingContact)
            .Include(x => x.PoLineItems)
                .ThenInclude(x => x.Part)
                    .ThenInclude(p => p!.UnitOfMeasure)
            .Where(x => x.DeletedBy == null);

        if (ids != null && ids.Any())
        {
            query = query.Where(x => ids.Contains(x.Id!.Value));
        }

        var purchaseOrders = await query.ToListAsync();

        if (!purchaseOrders.Any())
        {
            return NotFound("No purchase orders found matching the criteria");
        }

        var allCsvRows = new List<ZohoPurchaseOrderExportModel>();
        foreach (var po in purchaseOrders)
        {
            allCsvRows.AddRange(BuildZohoCsvRows(po));
        }

        var csvContent = GenerateCsvContent(allCsvRows);

        var fileName = $"PurchaseOrders_Zoho_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        return File(System.Text.Encoding.UTF8.GetBytes(csvContent), "text/csv", fileName);
    }

    private static List<ZohoPurchaseOrderExportModel> BuildZohoCsvRows(PurchaseOrder po)
    {
        var rows = new List<ZohoPurchaseOrderExportModel>();

        // Map PO status to Zoho status
        var zohoStatus = po.Status switch
        {
            PoStatus.Draft => "Draft",
            PoStatus.Submitted => "Draft",
            PoStatus.Issued => "Issued",
            PoStatus.PartiallyDelivered => "Issued",
            PoStatus.Delivered => "Issued",
            PoStatus.Closed => "Closed",
            PoStatus.Cancelled => "Cancelled",
            _ => "Draft"
        };

        // If no line items, create a single row with header info only
        if (po.PoLineItems == null || !po.PoLineItems.Any())
        {
            rows.Add(new ZohoPurchaseOrderExportModel
            {
                PurchaseOrderDate = po.OrderDate.ToString("yyyy-MM-dd"),
                ExpectedDeliveryDate = po.ExpectedDeliveryDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                PurchaseOrderNumber = po.Number,
                Reference = po.QuotationReferenceNumber ?? string.Empty,
                PurchaseOrderStatus = zohoStatus,
                VendorName = po.Company?.Name ?? string.Empty,
                CurrencyCode = po.Currency?.Code ?? "INR",
                TermsAndConditions = po.PoTerms ?? string.Empty,
                PaymentTerms = po.PaymentTerm?.DueDays.ToString() ?? string.Empty,
                PaymentTermsLabel = po.PaymentTerm?.Name ?? string.Empty,
                ProjectName = po.Project?.Name ?? string.Empty,
                Attention = po.VendorBillingContact != null ? $"{po.VendorBillingContact.FirstName} {po.VendorBillingContact.LastName}".Trim() : string.Empty,
                Adjustment = po.RoundOff?.ToString("0.####") ?? "0",
                EntityDiscountAmount = po.Discount?.ToString("0.####") ?? "0",
                DiscountType = MapDiscountType(po.DiscountType)
            });
            return rows;
        }

        // Create a row for each line item
        foreach (var lineItem in po.PoLineItems.Where(li => li.DeletedBy == null))
        {
            var row = new ZohoPurchaseOrderExportModel
            {
                // PO Header fields (repeated for each line item)
                PurchaseOrderDate = po.OrderDate.ToString("yyyy-MM-dd"),
                ExpectedDeliveryDate = po.ExpectedDeliveryDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                PurchaseOrderNumber = po.Number,
                Reference = po.QuotationReferenceNumber ?? string.Empty,
                PurchaseOrderStatus = zohoStatus,
                VendorName = po.Company?.Name ?? string.Empty,
                CurrencyCode = po.Currency?.Code ?? "INR",
                TermsAndConditions = po.PoTerms ?? string.Empty,
                PaymentTerms = po.PaymentTerm?.DueDays.ToString() ?? string.Empty,
                PaymentTermsLabel = po.PaymentTerm?.Name ?? string.Empty,
                ProjectName = po.Project?.Name ?? string.Empty,
                Attention = po.VendorBillingContact != null ? $"{po.VendorBillingContact.FirstName} {po.VendorBillingContact.LastName}".Trim() : string.Empty,
                Adjustment = po.RoundOff?.ToString("0.####") ?? "0",
                EntityDiscountAmount = po.Discount?.ToString("0.####") ?? "0",
                DiscountType = MapDiscountType(po.DiscountType),

                // Line item fields
                ItemType = lineItem.Part?.ItemType ?? "Part",
                ItemName = lineItem.Part?.Name ?? string.Empty,
                Sku = lineItem.Part?.PartNumber ?? lineItem.Part?.Number ?? string.Empty,
                ItemDesc = lineItem.Description ?? lineItem.Part?.Description ?? string.Empty,
                Quantity = lineItem.OrderedQuantity.ToString(),
                ItemPrice = lineItem.UnitPrice?.ToString("0.####") ?? "0",
                UsageUnit = lineItem.Part?.UnitOfMeasure?.Name ?? string.Empty,
                HsnSac = lineItem.Hsn ?? string.Empty,
                ItemTax = lineItem.Tax?.ToString("0.####") ?? string.Empty,
                ItemTaxType = lineItem.TaxType ?? string.Empty,
                DiscountAmount = lineItem.Discount?.ToString("0.####") ?? "0",
                IsInclusiveTax = (po.TaxOption?.ToLower() == "inclusive") ? "TRUE" : "FALSE"
            };

            rows.Add(row);
        }

        return rows;
    }

    private static string MapDiscountType(string? discountType)
    {
        if (string.IsNullOrEmpty(discountType))
            return string.Empty;

        return discountType.ToLower() switch
        {
            "percentage" or "percent" => "entity_level",
            "fixed" or "amount" => "entity_level",
            _ => "entity_level"
        };
    }

    private static string GenerateCsvContent(List<ZohoPurchaseOrderExportModel> rows)
    {
        var sb = new System.Text.StringBuilder();
        sb.AppendLine(ZohoPurchaseOrderExportModel.GetCsvHeader());

        foreach (var row in rows)
        {
            sb.AppendLine(row.ToCsvRow());
        }

        return sb.ToString();
    }

    #endregion

    private string? NormalizeDiscountType(string? type)
    {
        return string.IsNullOrWhiteSpace(type) || type == "null"
            ? null
            : type;
    }

    private IActionResult? ValidateDiscount(decimal? discount, string? discountType, decimal baseAmount, string context)
    {
        if (!discount.HasValue)
        {
            return null;
        }

        discountType = NormalizeDiscountType(discountType);

        // Percentage
        if (discountType == "Percentage")
        {
            if (discount < 0 || discount > 100)
            {
                return BadRequest($"{context} discount percentage must be between 0 and 100.");
            }

            var final = baseAmount - (baseAmount * discount.Value / 100);
            if (final < 0)
            {
                return BadRequest($"{context} total cannot be negative after discount.");
            }
        }
        else // Fixed
        {
            if (discount < 0)
            {
                return BadRequest($"{context} discount amount must be greater than or equal to 0.");
            }

            var final = baseAmount - discount.Value;
            if (final < 0)
            {
                return BadRequest($"{context} total cannot be negative after discount.");
            }
        }

        return null;
    }
}