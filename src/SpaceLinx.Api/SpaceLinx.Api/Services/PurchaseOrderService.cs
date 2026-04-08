using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services;

public class PurchaseOrderService(
    SpaceLinxContext spaceLinxContext,
    IHttpContextAccessor httpContextAccessor) : BaseService(spaceLinxContext, httpContextAccessor), IPurchaseOrderService
{
    private readonly SpaceLinxContext _context = spaceLinxContext;

    public async Task<PurchaseOrder> CreateFromRequisitionAsync(Guid requisitionId, CreatePurchaseOrderFromRequisitionModel model)
    {
        // 1. Validate requisition exists and is approved
        var requisition = await _context.Requisitions
            .Include(r => r.RequisitionLineItems.Where(li => li.DeletedBy == null))
            .FirstOrDefaultAsync(r => r.Id == requisitionId && r.DeletedBy == null);

        if (requisition == null)
        {
            throw new InvalidOperationException($"Requisition with ID {requisitionId} not found.");
        }

        if (requisition.Status != RequisitionStatus.Approved)
        {
            throw new InvalidOperationException($"Requisition must be in '{RequisitionStatus.Approved}' status to create a Purchase Order. Current status: {requisition.Status}");
        }

        // 2. Validate and fetch Company (vendor) with addresses
        var company = await _context.Companies
            .Include(c => c.CompanyAddresses.Where(ca => ca.DeletedBy == null))
            .Include(c => c.CompanyContacts.Where(cc => cc.DeletedBy == null))
            .FirstOrDefaultAsync(c => c.Id == model.CompanyId && c.DeletedBy == null);

        if (company == null)
        {
            throw new InvalidOperationException($"Company (vendor) with ID {model.CompanyId} not found.");
        }

        // 3. Get organization billing address from current user's organization
        var billingAddressId = model.BillingAddressId;
        if (!billingAddressId.HasValue || billingAddressId == Guid.Empty)
        {
            var staff = await _context.Staff
                .Include(s => s.Organization)
                    .ThenInclude(o => o.OrganizationAddresses.Where(oa => oa.DeletedBy == null))
                .FirstOrDefaultAsync(s => s.Email == UserEmail && s.DeletedBy == null);

            if (staff?.Organization != null)
            {
                var orgBillingAddress = staff.Organization.OrganizationAddresses
                    .FirstOrDefault(oa => oa.AddressType.Equals("Billing", StringComparison.OrdinalIgnoreCase));

                billingAddressId = orgBillingAddress?.AddressId;
            }

            if (!billingAddressId.HasValue || billingAddressId == Guid.Empty)
            {
                throw new InvalidOperationException("No billing address found. Please provide a billing address or configure one for your organization.");
            }
        }

        // Validate billing address exists
        var billingAddressExists = await _context.Addresses
            .AnyAsync(a => a.Id == billingAddressId && a.DeletedBy == null);

        if (!billingAddressExists)
        {
            throw new InvalidOperationException($"Billing address with ID {billingAddressId} not found.");
        }

        // 4. Get vendor billing address from company addresses
        var vendorBillingAddressId = model.VendorBillingAddressId;
        if (!vendorBillingAddressId.HasValue || vendorBillingAddressId == Guid.Empty)
        {
            var vendorBillingAddress = company.CompanyAddresses
                .FirstOrDefault(ca => ca.AddressType != null && ca.AddressType.Equals("Billing", StringComparison.OrdinalIgnoreCase));
            vendorBillingAddressId = vendorBillingAddress?.AddressId;
        }

        // 5. Get vendor billing contact from company contacts
        var vendorBillingContactId = model.VendorBillingContactId;
        if (!vendorBillingContactId.HasValue || vendorBillingContactId == Guid.Empty)
        {
            var vendorBillingContact = company.CompanyContacts
                .FirstOrDefault(cc => cc.ContactType != null && cc.ContactType.Equals("Billing", StringComparison.OrdinalIgnoreCase));
            vendorBillingContactId = vendorBillingContact?.ContactId;
        }

        // 6. Use vendor defaults for payment term and currency if not provided
        var paymentTermId = model.PaymentTermId ?? company.PaymentTermId;
        var currencyId = model.CurrencyId ?? company.CurrencyId;

        // 7. Validate optional IDs if provided
        if (model.DeliveryAddressId.HasValue)
        {
            var deliveryAddressExists = await _context.Addresses
                .AnyAsync(a => a.Id == model.DeliveryAddressId && a.DeletedBy == null);
            if (!deliveryAddressExists)
            {
                throw new InvalidOperationException($"Delivery address with ID {model.DeliveryAddressId} not found.");
            }
        }

        if (model.ShippingAddressId.HasValue)
        {
            var shippingAddressExists = await _context.Addresses
                .AnyAsync(a => a.Id == model.ShippingAddressId && a.DeletedBy == null);
            if (!shippingAddressExists)
            {
                throw new InvalidOperationException($"Shipping address with ID {model.ShippingAddressId} not found.");
            }
        }

        if (model.BuyerId.HasValue)
        {
            var buyerExists = await _context.Users
                .AnyAsync(s => s.Id == model.BuyerId && s.DeletedBy == null);
            if (!buyerExists)
            {
                throw new InvalidOperationException($"Buyer with ID {model.BuyerId} not found.");
            }
        }

        if (model.SupplyChainLeadId.HasValue)
        {
            var supplyChainLeadExists = await _context.Users
                .AnyAsync(s => s.Id == model.SupplyChainLeadId && s.DeletedBy == null);
            if (!supplyChainLeadExists)
            {
                throw new InvalidOperationException($"Supply Chain Lead with ID {model.SupplyChainLeadId} not found.");
            }
        }

        if (paymentTermId.HasValue)
        {
            var paymentTermExists = await _context.PaymentTerms
                .AnyAsync(p => p.Id == paymentTermId && p.DeletedBy == null);
            if (!paymentTermExists)
            {
                throw new InvalidOperationException($"Payment term with ID {paymentTermId} not found.");
            }
        }

        if (currencyId.HasValue)
        {
            var currencyExists = await _context.Currencies
                .AnyAsync(c => c.Id == currencyId && c.DeletedBy == null);
            if (!currencyExists)
            {
                throw new InvalidOperationException($"Currency with ID {currencyId} not found.");
            }
        }

        // 8. Generate PO number
        var poNumber = await GeneratePoNumberAsync();

        // 9. Build pricing lookup from request
        var pricingLookup = model.LineItemPricing?
            .ToDictionary(p => p.PartId, p => p) ?? new Dictionary<Guid, LineItemPricingModel>();

        // 10. Fetch existing CompanyPart pricing for parts not in the request
        var partIds = requisition.RequisitionLineItems.Select(li => li.PartId).ToList();
        var companyParts = await _context.CompanyParts
            .Where(cp => cp.CompanyId == model.CompanyId && partIds.Contains(cp.PartId) && cp.DeletedBy == null)
            .ToDictionaryAsync(cp => cp.PartId, cp => cp);

        // 11. Create Purchase Order
        var purchaseOrder = new PurchaseOrder
        {
            Number = poNumber,
            CompanyId = model.CompanyId,
            ProjectId = requisition.ProjectId,
            RequisitionId = requisitionId,
            BillingAddressId = billingAddressId.Value,
            DeliveryAddressId = model.DeliveryAddressId,
            ShippingAddressId = model.ShippingAddressId,
            VendorBillingAddressId = vendorBillingAddressId,
            VendorBillingContactId = vendorBillingContactId,
            BuyerId = model.BuyerId,
            SupplyChainLeadId = model.SupplyChainLeadId,
            PaymentTermId = paymentTermId,
            CurrencyId = currencyId,
            OrderDate = DateOnly.FromDateTime(DateTime.UtcNow),
            ExpectedDeliveryDate = model.ExpectedDeliveryDate ?? requisition.RequiredByDate,
            TaxOption = model.TaxOption,
            PoTerms = model.PoTerms,
            Description = model.Description,
            CustomerInstructions = model.CustomerInstructions,
            DeliveryTerms = model.DeliveryTerms,
            TermsAndConditions = model.TermsAndConditions,
            PoType = model.PoType,
            Status = PoStatus.Draft,
            DeliveryStatus = "Pending",
            TotalAmount = 0,
            IsActive = true,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow
        };

        _context.PurchaseOrders.Add(purchaseOrder);
        await _context.SaveChangesAsync();

        // 12. Copy RequisitionLineItems to PoLineItems
        decimal totalAmount = 0;

        foreach (var reqLineItem in requisition.RequisitionLineItems)
        {
            pricingLookup.TryGetValue(reqLineItem.PartId, out var pricing);
            companyParts.TryGetValue(reqLineItem.PartId, out var existingCompanyPart);

            // Use pricing from request, fallback to CompanyPart pricing, then default to 0
            var unitPrice = Math.Round(pricing?.UnitPrice ?? existingCompanyPart?.UnitPrice ?? 0, 4);
            var totalPrice = Math.Round(unitPrice * reqLineItem.Quantity, 4);
            var poLineItem = new PoLineItem
            {
                PurchaseOrderId = purchaseOrder.Id!.Value,
                PartId = reqLineItem.PartId,
                OrderedQuantity = reqLineItem.Quantity,
                PendingQuantity = reqLineItem.Quantity,
                ReceivedQuantity = 0,
                Description = reqLineItem.Description,
                UnitPrice = unitPrice,
                TotalPrice = totalPrice,
                Tax = pricing?.Tax != null ? Math.Round(pricing.Tax.Value, 4) : null,
                TaxType = pricing?.TaxType,
                Hsn = pricing?.Hsn,
                Discount = pricing?.Discount != null ? Math.Round(pricing.Discount.Value, 4) : null,
                DiscountType = pricing?.DiscountType,
                ExpectedDeliveryDate = model.ExpectedDeliveryDate ?? requisition.RequiredByDate,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            _context.PoLineItems.Add(poLineItem);
            totalAmount = Math.Round(totalAmount + totalPrice, 4);
            // 13. Create CompanyPart record if it doesn't exist
            if (existingCompanyPart == null)
            {
                var companyPart = new CompanyPart
                {
                    CompanyId = model.CompanyId,
                    PartId = reqLineItem.PartId,
                    UnitPrice = pricing?.UnitPrice,
                    CurrencyId = currencyId,
                    IsPreferred = false,
                    IsActive = true,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CompanyParts.Add(companyPart);
            }
        }

        // Update total amount on PO
        purchaseOrder.TotalAmount = totalAmount;

        requisition.Status = RequisitionStatus.PoCreated;
        requisition.UpdatedBy = UserEmail;
        requisition.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

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
}
