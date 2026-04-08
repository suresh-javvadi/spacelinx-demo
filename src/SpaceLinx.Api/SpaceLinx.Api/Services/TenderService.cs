using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using SystemTask = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class TenderService : BaseService, ITenderService
{
    private readonly SpaceLinxContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<TenderService> _logger;

    public TenderService(
        SpaceLinxContext context,
        IMapper mapper,
        IHttpContextAccessor contextAccessor,
        ILogger<TenderService> logger)
        : base(context, contextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<string> GenerateTenderNumberAsync()
    {
        var currentYear = DateTime.UtcNow.Year.ToString();
        var prefix = $"TND-{currentYear}-";

        var lastTender = await _context.Tenders
            .Where(t => t.TenderNumber.StartsWith(prefix))
            .OrderByDescending(t => t.TenderNumber)
            .FirstOrDefaultAsync();

        int nextSeq = 1;
        if (lastTender != null)
        {
            var lastNum = lastTender.TenderNumber.Substring(prefix.Length);
            if (int.TryParse(lastNum, out int lastSeq))
            {
                nextSeq = lastSeq + 1;
            }
        }

        return $"{prefix}{nextSeq:D5}";
    }

    public async Task<Tender> CreateTenderAsync(TenderCreateModel model)
    {
        var tender = new Tender
        {
            TenderNumber = await GenerateTenderNumberAsync(),
            Title = model.Title,
            Description = model.Description,
            Status = TenderStatus.Draft,
            RequisitionId = model.RequisitionId,
            ProjectId = model.ProjectId,
            ClosingDate = model.ClosingDate,
            BuyerId = model.BuyerId,
            Terms = model.Terms,
            PaymentTermId = model.PaymentTermId,
            CurrencyId = model.CurrencyId,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _context.Tenders.AddAsync(tender);
        await _context.SaveChangesAsync();

        // Add line items if provided
        if (model.LineItems?.Any() == true)
        {
            int lineNumber = 1;
            foreach (var item in model.LineItems)
            {
                var lineItem = _mapper.Map<TenderLineItem>(item);
                lineItem.TenderId = tender.Id!.Value;
                lineItem.LineNumber = lineNumber++;
                lineItem.CreatedBy = UserEmail;
                lineItem.CreatedAt = DateTime.UtcNow;
                lineItem.IsActive = true;
                await _context.TenderLineItems.AddAsync(lineItem);
            }
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Tender {TenderNumber} created by {UserEmail}", tender.TenderNumber, UserEmail);
        return tender;
    }

    public async Task<Tender> CreateFromRequisitionAsync(Guid requisitionId)
    {
        var requisition = await _context.Requisitions
            .Include(r => r.RequisitionLineItems)
            .ThenInclude(li => li.Part)
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
            throw new InvalidOperationException("Requisition not found");

        if (requisition.Status != RequisitionStatus.Approved)
            throw new InvalidOperationException("Requisition must be in Approved status to create a tender");

        var tender = new Tender
        {
            TenderNumber = await GenerateTenderNumberAsync(),
            Title = $"Tender for {requisition.Title ?? requisition.ReqNumber}",
            Description = requisition.Justification,
            Status = TenderStatus.Draft,
            RequisitionId = requisitionId,
            ProjectId = requisition.ProjectId,
            ClosingDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(14)), // Default 2 weeks
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _context.Tenders.AddAsync(tender);
        await _context.SaveChangesAsync();

        // Copy requisition line items to tender line items
        int lineNumber = 1;
        foreach (var reqItem in requisition.RequisitionLineItems.Where(li => li.DeletedBy == null))
        {
            var tenderLineItem = new TenderLineItem
            {
                TenderId = tender.Id!.Value,
                PartId = reqItem.PartId,
                Quantity = reqItem.Quantity,
                Description = reqItem.Description,
                LineNumber = lineNumber++,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _context.TenderLineItems.AddAsync(tenderLineItem);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Tender {TenderNumber} created from Requisition {ReqNumber} by {UserEmail}",
            tender.TenderNumber, requisition.ReqNumber, UserEmail);

        return tender;
    }

    public async Task<TenderDetailsReadModel?> GetTenderDetailsAsync(Guid id)
    {
        var tender = await _context.Tenders
            .Include(t => t.Requisition)
            .Include(t => t.Project)
            .Include(t => t.AwardedVendor)
            .Include(t => t.Buyer)
            .Include(t => t.PaymentTerm)
            .Include(t => t.Currency)
            .Include(t => t.TenderLineItems.Where(li => li.DeletedBy == null))
                .ThenInclude(li => li.Part)
            .Include(t => t.TenderLineItems.Where(li => li.DeletedBy == null))
                .ThenInclude(li => li.UnitOfMeasure)
            .Include(t => t.TenderVendors.Where(v => v.DeletedBy == null))
                .ThenInclude(v => v.Company)
            .Include(t => t.TenderQuotations.Where(q => q.DeletedBy == null))
                .ThenInclude(q => q.Company)
            .Include(t => t.TenderQuotations.Where(q => q.DeletedBy == null))
                .ThenInclude(q => q.Currency)
            .FirstOrDefaultAsync(t => t.Id == id && t.DeletedBy == null);

        if (tender == null)
            return null;

        return _mapper.Map<TenderDetailsReadModel>(tender);
    }

    public async Task<IActionResult> UpdateTenderAsync(Guid id, TenderUpdateModel model)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == id && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft)
            return new BadRequestObjectResult("Can only update tenders in Draft status");

        _mapper.Map(model, tender);
        tender.UpdatedBy = UserEmail;
        tender.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Tender {TenderNumber} updated by {UserEmail}", tender.TenderNumber, UserEmail);
        return new OkResult();
    }

    public async Task<IActionResult> AddLineItemsAsync(Guid tenderId, List<TenderLineItemWriteModel> lineItems)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft)
            return new BadRequestObjectResult("Can only add line items to tenders in Draft status");

        var maxLineNumber = await _context.TenderLineItems
            .Where(li => li.TenderId == tenderId && li.DeletedBy == null)
            .MaxAsync(li => (int?)li.LineNumber) ?? 0;

        foreach (var item in lineItems)
        {
            var lineItem = _mapper.Map<TenderLineItem>(item);
            lineItem.TenderId = tenderId;
            lineItem.LineNumber = ++maxLineNumber;
            lineItem.CreatedBy = UserEmail;
            lineItem.CreatedAt = DateTime.UtcNow;
            lineItem.IsActive = true;
            await _context.TenderLineItems.AddAsync(lineItem);
        }

        await _context.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<IActionResult> UpdateLineItemsAsync(Guid tenderId, List<TenderLineItemWriteModel> lineItems)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft)
            return new BadRequestObjectResult("Can only update line items for tenders in Draft status");

        // Soft delete existing line items
        var existingItems = await _context.TenderLineItems
            .Where(li => li.TenderId == tenderId && li.DeletedBy == null)
            .ToListAsync();

        foreach (var item in existingItems)
        {
            item.DeletedBy = UserEmail;
            item.DeletedAt = DateTime.UtcNow;
        }

        // Add new line items
        int lineNumber = 1;
        foreach (var item in lineItems)
        {
            var lineItem = _mapper.Map<TenderLineItem>(item);
            lineItem.TenderId = tenderId;
            lineItem.LineNumber = lineNumber++;
            lineItem.CreatedBy = UserEmail;
            lineItem.CreatedAt = DateTime.UtcNow;
            lineItem.IsActive = true;
            await _context.TenderLineItems.AddAsync(lineItem);
        }

        await _context.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<IActionResult> RemoveLineItemAsync(Guid tenderId, Guid lineItemId)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft)
            return new BadRequestObjectResult("Can only remove line items from tenders in Draft status");

        var lineItem = await _context.TenderLineItems
            .FirstOrDefaultAsync(li => li.Id == lineItemId && li.TenderId == tenderId && li.DeletedBy == null);

        if (lineItem == null)
            return new NotFoundObjectResult("Line item not found");

        lineItem.DeletedBy = UserEmail;
        lineItem.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<IActionResult> InviteVendorsAsync(Guid tenderId, List<TenderVendorWriteModel> vendors)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Draft && tender.Status != TenderStatus.Published)
            return new BadRequestObjectResult("Can only invite vendors to tenders in Draft or Published status");

        foreach (var vendor in vendors)
        {
            // Check if vendor already invited
            var existing = await _context.TenderVendors
                .FirstOrDefaultAsync(v => v.TenderId == tenderId && v.CompanyId == vendor.CompanyId && v.DeletedBy == null);

            if (existing != null)
                continue;

            var tenderVendor = new TenderVendor
            {
                TenderId = tenderId,
                CompanyId = vendor.CompanyId,
                InvitedDate = DateTime.UtcNow,
                ResponseDeadline = vendor.ResponseDeadline ?? tender.ClosingDate,
                Status = TenderVendorStatus.Invited,
                Notes = vendor.Notes,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _context.TenderVendors.AddAsync(tenderVendor);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Invited {Count} vendors to Tender {TenderNumber}", vendors.Count, tender.TenderNumber);
        return new OkResult();
    }

    public async Task<IActionResult> UpdateVendorStatusAsync(Guid tenderId, Guid vendorId, string status)
    {
        var tenderVendor = await _context.TenderVendors
            .FirstOrDefaultAsync(v => v.Id == vendorId && v.TenderId == tenderId && v.DeletedBy == null);

        if (tenderVendor == null)
            return new NotFoundObjectResult("Tender vendor not found");

        tenderVendor.Status = status;
        tenderVendor.UpdatedBy = UserEmail;
        tenderVendor.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<List<TenderVendorReadModel>> GetVendorsAsync(Guid tenderId)
    {
        var vendors = await _context.TenderVendors
            .Include(v => v.Company)
            .Where(v => v.TenderId == tenderId && v.DeletedBy == null)
            .ToListAsync();

        return _mapper.Map<List<TenderVendorReadModel>>(vendors);
    }

    public async Task<IActionResult> AddQuotationAsync(Guid tenderId, TenderQuotationWriteModel quotation)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Published && tender.Status != TenderStatus.Closed)
            return new BadRequestObjectResult("Can only add quotations to Published or Closed tenders");

        var tenderQuotation = _mapper.Map<TenderQuotation>(quotation);
        tenderQuotation.TenderId = tenderId;
        tenderQuotation.CreatedBy = UserEmail;
        tenderQuotation.CreatedAt = DateTime.UtcNow;
        tenderQuotation.IsActive = true;

        await _context.TenderQuotations.AddAsync(tenderQuotation);
        await _context.SaveChangesAsync();

        // Add line items if provided
        if (quotation.LineItems?.Any() == true)
        {
            foreach (var item in quotation.LineItems)
            {
                var lineItem = _mapper.Map<TenderQuotationLineItem>(item);
                lineItem.TenderQuotationId = tenderQuotation.Id!.Value;
                lineItem.TotalPrice = item.UnitPrice * item.Quantity;
                lineItem.CreatedBy = UserEmail;
                lineItem.CreatedAt = DateTime.UtcNow;
                lineItem.IsActive = true;
                await _context.TenderQuotationLineItems.AddAsync(lineItem);
            }
            await _context.SaveChangesAsync();
        }

        // Update vendor status to Responded
        var vendor = await _context.TenderVendors
            .FirstOrDefaultAsync(v => v.TenderId == tenderId && v.CompanyId == quotation.CompanyId && v.DeletedBy == null);
        if (vendor != null)
        {
            vendor.Status = TenderVendorStatus.Responded;
            vendor.UpdatedBy = UserEmail;
            vendor.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Quotation added to Tender {TenderNumber} from vendor {CompanyId}",
            tender.TenderNumber, quotation.CompanyId);

        return new OkObjectResult(tenderQuotation.Id);
    }

    public async Task<IActionResult> UpdateQuotationAsync(Guid tenderId, Guid quotationId, TenderQuotationWriteModel quotation)
    {
        var existing = await _context.TenderQuotations
            .FirstOrDefaultAsync(q => q.Id == quotationId && q.TenderId == tenderId && q.DeletedBy == null);

        if (existing == null)
            return new NotFoundObjectResult("Quotation not found");

        _mapper.Map(quotation, existing);
        existing.UpdatedBy = UserEmail;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return new OkResult();
    }

    public async Task<TenderQuotationReadModel?> GetQuotationDetailsAsync(Guid quotationId)
    {
        var quotation = await _context.TenderQuotations
            .Include(q => q.Company)
            .Include(q => q.Currency)
            .Include(q => q.TenderQuotationLineItems.Where(li => li.DeletedBy == null))
                .ThenInclude(li => li.TenderLineItem)
            .FirstOrDefaultAsync(q => q.Id == quotationId && q.DeletedBy == null);

        if (quotation == null)
            return null;

        return _mapper.Map<TenderQuotationReadModel>(quotation);
    }

    public async Task<List<TenderQuotationReadModel>> GetQuotationsAsync(Guid tenderId)
    {
        var quotations = await _context.TenderQuotations
            .Include(q => q.Company)
            .Include(q => q.Currency)
            .Where(q => q.TenderId == tenderId && q.DeletedBy == null)
            .ToListAsync();

        return _mapper.Map<List<TenderQuotationReadModel>>(quotations);
    }

    public async Task<IActionResult> PublishAsync(Guid tenderId)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Submitted)
            return new BadRequestObjectResult("Tender must be Approved to publish");

        tender.Status = TenderStatus.Published;
        tender.PublishDate = DateOnly.FromDateTime(DateTime.UtcNow);
        tender.UpdatedBy = UserEmail;
        tender.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Tender {TenderNumber} published by {UserEmail}", tender.TenderNumber, UserEmail);
        return new OkResult();
    }

    public async Task<IActionResult> CloseAsync(Guid tenderId)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Published)
            return new BadRequestObjectResult("Tender must be Published to close");

        tender.Status = TenderStatus.Closed;
        tender.UpdatedBy = UserEmail;
        tender.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Tender {TenderNumber} closed by {UserEmail}", tender.TenderNumber, UserEmail);
        return new OkResult();
    }

    public async Task<IActionResult> AwardAsync(Guid tenderId, Guid quotationId)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status != TenderStatus.Closed)
            return new BadRequestObjectResult("Tender must be Closed to award");

        var quotation = await _context.TenderQuotations
            .FirstOrDefaultAsync(q => q.Id == quotationId && q.TenderId == tenderId && q.DeletedBy == null);

        if (quotation == null)
            return new NotFoundObjectResult("Quotation not found");

        // Mark quotation as selected
        quotation.IsSelected = true;
        quotation.UpdatedBy = UserEmail;
        quotation.UpdatedAt = DateTime.UtcNow;

        // Update tender
        tender.Status = TenderStatus.Awarded;
        tender.AwardedVendorId = quotation.CompanyId;
        tender.AwardedDate = DateTime.UtcNow;
        tender.AwardedBy = UserEmail;
        tender.UpdatedBy = UserEmail;
        tender.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Update CompanyPart pricing
        await UpdateCompanyPartFromAwardedQuotationAsync(quotationId);

        _logger.LogInformation("Tender {TenderNumber} awarded to vendor {VendorId} by {UserEmail}",
            tender.TenderNumber, quotation.CompanyId, UserEmail);

        return new OkResult();
    }

    public async Task<IActionResult> CancelAsync(Guid tenderId, string? reason)
    {
        var tender = await _context.Tenders
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            return new NotFoundObjectResult("Tender not found");

        if (tender.Status == TenderStatus.Awarded)
            return new BadRequestObjectResult("Cannot cancel an awarded tender");

        tender.Status = TenderStatus.Cancelled;
        tender.ApproverComment = reason;
        tender.UpdatedBy = UserEmail;
        tender.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Tender {TenderNumber} cancelled by {UserEmail}. Reason: {Reason}",
            tender.TenderNumber, UserEmail, reason);

        return new OkResult();
    }

    public async Task<PurchaseOrder> CreatePurchaseOrderFromTenderAsync(Guid tenderId)
    {
        var tender = await _context.Tenders
            .Include(t => t.TenderQuotations.Where(q => q.IsSelected && q.DeletedBy == null))
                .ThenInclude(q => q.TenderQuotationLineItems.Where(li => li.DeletedBy == null))
                    .ThenInclude(li => li.TenderLineItem)
                        .ThenInclude(tli => tli.Part)
            .FirstOrDefaultAsync(t => t.Id == tenderId && t.DeletedBy == null);

        if (tender == null)
            throw new InvalidOperationException("Tender not found");

        if (tender.Status != TenderStatus.Awarded)
            throw new InvalidOperationException("Tender must be Awarded to create a Purchase Order");

        var awardedQuotation = tender.TenderQuotations.FirstOrDefault(q => q.IsSelected);
        if (awardedQuotation == null)
            throw new InvalidOperationException("No awarded quotation found");

        // Generate PO number - following existing pattern
        var poNumber = await GeneratePoNumberAsync();

        var purchaseOrder = new PurchaseOrder
        {
            Number = poNumber,
            CompanyId = awardedQuotation.CompanyId,
            Status = PoStatus.Draft,
            DeliveryStatus = "Pending",
            OrderDate = DateOnly.FromDateTime(DateTime.UtcNow),
            TotalAmount = awardedQuotation.TotalAmount,
            CurrencyId = awardedQuotation.CurrencyId ?? tender.CurrencyId,
            PaymentTermId = tender.PaymentTermId,
            ProjectId = tender.ProjectId,
            RequisitionId = tender.RequisitionId,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        await _context.PurchaseOrders.AddAsync(purchaseOrder);
        await _context.SaveChangesAsync();

        // Copy quotation line items to PO line items
        foreach (var qli in awardedQuotation.TenderQuotationLineItems)
        {
            var poLineItem = new PoLineItem
            {
                PurchaseOrderId = purchaseOrder.Id!.Value,
                PartId = qli.TenderLineItem.PartId,
                OrderedQuantity = qli.Quantity,
                UnitPrice = qli.UnitPrice,
                TotalPrice = qli.TotalPrice,
                Description = qli.TenderLineItem.Description,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _context.PoLineItems.AddAsync(poLineItem);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Purchase Order {PoNumber} created from Tender {TenderNumber} by {UserEmail}",
            poNumber, tender.TenderNumber, UserEmail);

        return purchaseOrder;
    }

    private async Task<string> GeneratePoNumberAsync()
    {
        var currentYear = DateTime.UtcNow.Year.ToString();
        var prefix = $"PO-{currentYear}-";

        var lastPo = await _context.PurchaseOrders
            .Where(p => p.Number.StartsWith(prefix))
            .OrderByDescending(p => p.Number)
            .FirstOrDefaultAsync();

        int nextSeq = 1;
        if (lastPo != null)
        {
            var lastNum = lastPo.Number.Substring(prefix.Length);
            if (int.TryParse(lastNum, out int lastSeq))
            {
                nextSeq = lastSeq + 1;
            }
        }

        return $"{prefix}{nextSeq:D5}";
    }

    public async SystemTask UpdateCompanyPartFromAwardedQuotationAsync(Guid quotationId)
    {
        var quotation = await _context.TenderQuotations
            .Include(q => q.TenderQuotationLineItems.Where(li => li.DeletedBy == null))
                .ThenInclude(li => li.TenderLineItem)
            .FirstOrDefaultAsync(q => q.Id == quotationId && q.DeletedBy == null);

        if (quotation == null)
            return;

        foreach (var qli in quotation.TenderQuotationLineItems)
        {
            var partId = qli.TenderLineItem.PartId;
            var companyId = quotation.CompanyId;

            // Find or create CompanyPart
            var companyPart = await _context.CompanyParts
                .FirstOrDefaultAsync(cp => cp.CompanyId == companyId && cp.PartId == partId && cp.DeletedBy == null);

            if (companyPart == null)
            {
                companyPart = new CompanyPart
                {
                    CompanyId = companyId,
                    PartId = partId,
                    UnitPrice = qli.UnitPrice,
                    CurrencyId = quotation.CurrencyId,
                    LeadTimeDays = qli.LeadTimeDays ?? quotation.LeadTimeDays,
                    ValidFrom = DateOnly.FromDateTime(DateTime.UtcNow),
                    ValidTo = quotation.ValidUntil,
                    IsPreferred = false,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                await _context.CompanyParts.AddAsync(companyPart);
            }
            else
            {
                companyPart.UnitPrice = qli.UnitPrice;
                companyPart.CurrencyId = quotation.CurrencyId;
                companyPart.LeadTimeDays = qli.LeadTimeDays ?? quotation.LeadTimeDays;
                companyPart.ValidFrom = DateOnly.FromDateTime(DateTime.UtcNow);
                companyPart.ValidTo = quotation.ValidUntil;
                companyPart.UpdatedBy = UserEmail;
                companyPart.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("CompanyPart prices updated from quotation {QuotationId}", quotationId);
    }
}
