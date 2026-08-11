using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class GoodsReceiptNoteService(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor, IDocumentService documentService)
        : BaseService(spaceLinxContext, _contextAccessor), IGoodsReceiptNoteService
{
    public async Task<GoodsReceiptNote> CreateGrnAsync(GrnWithLineItemWriteModel request)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();

        try
        {
            PurchaseOrder? purchaseOrder = null;

            if (request.PurchaseOrderId != null)
            {
                purchaseOrder = await spaceLinxContext.PurchaseOrders
                    .Include(po => po.PoLineItems).ThenInclude(pli => pli.Currency)
                    .FirstOrDefaultAsync(po => po.Id == request.PurchaseOrderId && po.DeletedBy == null);

                if (purchaseOrder == null)
                {
                    throw new InvalidOperationException("Purchase Order not found.");
                }

                foreach (var item in request.LineItems)
                {
                    var poLine = purchaseOrder.PoLineItems.FirstOrDefault(l => l.Id == item.PoLineItemId && l.DeletedBy == null);
                    if (poLine is null)
                    {
                        throw new InvalidOperationException($"PO Line Item ID {item.PoLineItemId} not found on the Purchase Order.");
                    }

                    var pendingQty = poLine.OrderedQuantity - (poLine.ReceivedQuantity ?? 0);
                    if (item.ReceivedQuantity > pendingQty)
                    {
                        throw new InvalidOperationException($"Received quantity for Part ID {item.PartId} exceeds pending quantity ({pendingQty}).");
                    }
                    if (item.ReceivedQuantity <= 0)
                    {
                        throw new InvalidOperationException($"Received quantity for Part ID {item.PartId} must be positive.");
                    }

                    poLine.PendingQuantity = pendingQty;
                }
            }

            var user = await spaceLinxContext.Users.FirstOrDefaultAsync(x => x.Email == UserEmail && x.DeletedBy == null);

            var grnEntity = new GoodsReceiptNote
            {
                PurchaseOrderId = request.PurchaseOrderId,
                ReceivedDate = request.ReceivedDate,
                ReceivedById = user?.Id,
                LocationId = request.LocationId,
                ReferenceNumber = request.ReferenceNumber,
                InvoiceNumber = request.InvoiceNumber,
                InvoiceDate = request.InvoiceDate,
                Description = request.Notes,
                Status = GrnStatus.InProcess,
                VendorId = request.VendorId,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = UserEmail,
                IsActive = true
            };
            spaceLinxContext.GoodsReceiptNotes.Add(grnEntity);
            await spaceLinxContext.SaveChangesAsync();

            var grnLineEntities = new List<GrnLineItem>();
            var partCache = new Dictionary<(Guid, Guid?, Guid?), InventoryPart>();

            // Batch-load parts referenced by the line items instead of querying per item
            var requestPartIds = request.LineItems.Select(i => i.PartId).Distinct().ToList();
            var partsById = (await spaceLinxContext.Parts
                .Where(p => requestPartIds.Contains(p.Id!.Value))
                .ToListAsync())
                .ToDictionary(p => p.Id!.Value);

            // Normalize tracking fields per item first (needs only the batch-loaded parts, no DB calls)
            foreach (var item in request.LineItems)
            {
                partsById.TryGetValue(item.PartId, out var itemPart);
                var isGoodsOrService = itemPart != null && (itemPart.ItemType == "Goods" || itemPart.ItemType == "Services");

                if (isGoodsOrService)
                {
                    if (!string.IsNullOrWhiteSpace(item.TrackingMethod) && !item.TrackingMethod.Equals("None", StringComparison.OrdinalIgnoreCase) && !item.TrackingMethod.Equals("null", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException("TrackingMethod must be 'None' or empty for Goods/Services");
                    }
                    item.TrackingMethod = null;
                    item.TrackingId = null;
                }
                else
                {
                    if (string.IsNullOrWhiteSpace(item.TrackingMethod) || item.TrackingMethod.Equals("null", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException("TrackingMethod is required for Parts");
                    }
                }

                if (string.IsNullOrWhiteSpace(item.TrackingId) || item.TrackingId.Equals("null", StringComparison.OrdinalIgnoreCase))
                {
                    item.TrackingId = null;
                }
            }

            // Batch-load inventory stock/part rows referenced by the (now normalized) line items
            var stockLookup = (await spaceLinxContext.InventoryStocks
                .Where(s => requestPartIds.Contains(s.PartId) && s.DeletedBy == null)
                .ToListAsync())
                .GroupBy(s => (s.PartId, s.TrackingId))
                .ToDictionary(g => g.Key, g => g.First());

            var inventoryPartLookup = (await spaceLinxContext.InventoryParts
                .Where(p => requestPartIds.Contains(p.PartId) && p.LocationId == request.LocationId && p.BinId == null && p.DeletedBy == null)
                .ToListAsync())
                .GroupBy(p => p.PartId)
                .ToDictionary(g => g.Key, g => g.First());

            foreach (var item in request.LineItems)
            {
                var grnLineItem = new GrnLineItem
                {
                    GrnId = grnEntity.Id.Value,
                    PartId = item.PartId,
                    PoLineItemId = item.PoLineItemId,
                    ReceivedQuantity = item.ReceivedQuantity,
                    TrackingMethod = item.TrackingMethod,
                    TrackingId = item.TrackingId,
                    ManufacturingDate = item.ManufacturingDate,
                    ExpiryDate = item.ExpiryDate,
                    DateCode = item.DateCode,
                    HsnCode = item.HsnCode,
                    Remark = item.Remark,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
                grnLineEntities.Add(grnLineItem);

                if (purchaseOrder != null && item.PoLineItemId.HasValue)
                {
                    var poLineToUpdate = purchaseOrder.PoLineItems.First(l => l.Id == item.PoLineItemId.Value);
                    poLineToUpdate.ReceivedQuantity = (poLineToUpdate.ReceivedQuantity ?? 0) + (item.ReceivedQuantity ?? 0);
                    poLineToUpdate.PendingQuantity = poLineToUpdate.OrderedQuantity - (poLineToUpdate.ReceivedQuantity ?? 0);
                    poLineToUpdate.UpdatedBy = UserEmail;
                    poLineToUpdate.UpdatedAt = DateTime.UtcNow;
                }

                stockLookup.TryGetValue((item.PartId, item.TrackingId), out var stock);

                var partKey = (item.PartId, request.LocationId, (Guid?)null);
                partCache.TryGetValue(partKey, out var part);
                if (part == null)
                {
                    inventoryPartLookup.TryGetValue(item.PartId, out part);
                }

                var qty = item.ReceivedQuantity ?? 0;
                var poLineItem = purchaseOrder?.PoLineItems.FirstOrDefault(l => l.Id == item.PoLineItemId);

                if (stock != null)
                {
                    stock.HsnCode = item.HsnCode;
                    stock.QtyQcPending = (stock.QtyQcPending) + qty;
                    stock.QtyOnhand += qty;
                    stock.UpdatedBy = UserEmail;
                    stock.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    stock = new InventoryStock
                    {
                        PartId = item.PartId,
                        LocationId = request.LocationId,
                        QtyOnhand = qty,
                        QtyQcPending = qty,
                        TrackingType = item.TrackingMethod,
                        TrackingId = item.TrackingId,
                        HsnCode = item.HsnCode,
                        UnitPrice = poLineItem?.UnitPrice,
                        ConversionRate = poLineItem?.ConversionRate,
                        Currency = poLineItem?.Currency?.Code,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };
                    spaceLinxContext.InventoryStocks.Add(stock);
                    stockLookup[(item.PartId, item.TrackingId)] = stock;
                }

                if (part != null)
                {
                    part.HsnCode = item.HsnCode;
                    part.QtyQcPending += qty;
                    if (item.TrackingMethod != null && part.TrackingType != item.TrackingMethod)
                    {
                        throw new InvalidOperationException(
                            $"Tracking Type cannot be updated. Part {part.PartId} already has Tracking Type as {part.TrackingType}.");
                    }
                    part.QtyOnhand += qty;
                    part.UpdatedBy = UserEmail;
                    part.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    part = new InventoryPart
                    {
                        PartId = item.PartId,
                        LocationId = request.LocationId,
                        QtyQcPending = qty,
                        TrackingType = item.TrackingMethod,
                        QtyOnhand = qty,
                        HsnCode = item.HsnCode,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };
                    spaceLinxContext.InventoryParts.Add(part);
                }
                partCache[partKey] = part;

                var transactionEntry = new InventoryTransaction
                {
                    PartId = item.PartId,
                    ToLocationId = request.LocationId,
                    TransactionType = "Received",
                    PreviousQuantity = stock?.QtyOnhand ?? 0,
                    CurrentQuantity = part?.QtyOnhand ?? 0,
                    TransactedQuantity = item.ReceivedQuantity ?? 0,
                    ReferenceType = purchaseOrder != null ? "PO" : "GRN",
                    ReferenceId = purchaseOrder?.Id ?? grnEntity.Id,
                    TrackingType = item.TrackingMethod,
                    TrackingId = item.TrackingId,
                    TransactionDate = DateTime.UtcNow,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Notes = $"GRN Created - {item.ReceivedQuantity} qty pending Quality Check"
                };
                spaceLinxContext.InventoryTransactions.Add(transactionEntry);
            }

            spaceLinxContext.GrnLineItems.AddRange(grnLineEntities);
            await spaceLinxContext.SaveChangesAsync();

            if (request.DocumentFiles != null && request.DocumentFiles.Any())
            {
                foreach (var doc in request.DocumentFiles)
                {
                    doc.EntityId = grnEntity.Id!.Value;
                    doc.EntityType = SpaceLinxEntities.GoodsReceiptNote;

                    await documentService.SaveDocumentAsync(doc);
                }
            }
            if (purchaseOrder != null)
            {
                bool allReceived = purchaseOrder.PoLineItems.All(l => l.PendingQuantity == 0);

                if (allReceived)
                {
                    purchaseOrder.Status = PoStatus.Delivered;
                }
                else
                {
                    purchaseOrder.Status = PoStatus.PartiallyDelivered;
                }

                purchaseOrder.UpdatedBy = UserEmail;
                purchaseOrder.UpdatedAt = DateTime.UtcNow;

                spaceLinxContext.PurchaseOrders.Update(purchaseOrder);
            }
            await spaceLinxContext.SaveChangesAsync();

            await transaction.CommitAsync();

            return grnEntity;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task UpdateGrnLineItemQcAsync(List<GrnLineItemQcAlterModel> records)
    {
        if (records == null || !records.Any())
            throw new InvalidOperationException("No QC records provided");

        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();

        try
        {
            var user = await spaceLinxContext.Users
                .FirstOrDefaultAsync(x => x.Email == UserEmail && x.DeletedBy == null);

            var firstLineItem = await spaceLinxContext.GrnLineItems
                .FirstAsync(x => x.Id == records.First().Id && x.DeletedBy == null);

            var grn = await spaceLinxContext.GoodsReceiptNotes
                .FirstAsync(x => x.Id == firstLineItem.GrnId && x.DeletedBy == null);

            foreach (var record in records)
            {
                var lineItem = await spaceLinxContext.GrnLineItems
                    .FirstOrDefaultAsync(x => x.Id == record.Id && x.DeletedBy == null);

                if (lineItem == null)
                    throw new InvalidOperationException($"Line Item not found: {record.Id}");

                lineItem.QcStatus = record.QcStatus;
                lineItem.ManufacturingDate = record.ManufacturingDate;
                lineItem.ExpiryDate = record.ExpiryDate;
                lineItem.DateCode = record.DateCode;
                lineItem.QcDate = DateTime.UtcNow;
                lineItem.CheckedById = user?.Id;
                lineItem.QcRemark = record.QcRemark;
                lineItem.UpdatedBy = UserEmail;
                lineItem.UpdatedAt = DateTime.UtcNow;

                if (record.QcStatus == GrnLineItemStatus.Fail)
                {
                    var qty = lineItem.ReceivedQuantity ?? 0;

                    var stock = await spaceLinxContext.InventoryStocks
                        .FirstOrDefaultAsync(s => s.PartId == lineItem.PartId && s.TrackingId == lineItem.TrackingId && s.DeletedBy == null);

                    if (stock != null)
                    {
                        stock.QtyQcPending -= qty;
                        stock.QtyQcFailed += qty;
                        stock.UpdatedBy = UserEmail;
                        stock.UpdatedAt = DateTime.UtcNow;
                    }

                    var part = await spaceLinxContext.InventoryParts
                        .FirstOrDefaultAsync(p => p.PartId == lineItem.PartId && p.LocationId == grn.LocationId && p.BinId == null && p.DeletedBy == null);

                    if (part != null)
                    {
                        part.QtyQcPending -= qty;
                        part.QtyQcFailed += qty;
                        part.UpdatedBy = UserEmail;
                        part.UpdatedAt = DateTime.UtcNow;
                    }

                    spaceLinxContext.InventoryTransactions.Add(new InventoryTransaction
                    {
                        PartId = lineItem.PartId,
                        ToLocationId = grn.LocationId,
                        TransactionType = "QC Failed",
                        PreviousQuantity = stock?.QtyOnhand ?? 0,
                        CurrentQuantity = stock?.QtyOnhand ?? 0,
                        TransactedQuantity = qty,
                        ReferenceType = "GRN",
                        ReferenceId = grn.Id,
                        TrackingType = lineItem.TrackingMethod,
                        TrackingId = lineItem.TrackingId,
                        TransactionDate = DateTime.UtcNow,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true,
                        Notes = $"QC Failed - {qty} qty moved from QC Pending to QC Failed for GRN line item {lineItem.Id}"
                    });
                }
            }

            await spaceLinxContext.SaveChangesAsync();
            await UpdateGrnStatusAsync(grn.Id.Value);

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task AcceptGrnLineItemsAsync(GrnLineItemsAcceptModel request)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();

        try
        {
            if (request.LineItemIds == null || !request.LineItemIds.Any())
                throw new InvalidOperationException("No line items provided");

            var lineItems = await spaceLinxContext.GrnLineItems
                .Where(x => request.LineItemIds.Contains(x.Id.Value) && x.DeletedBy == null)
                .ToListAsync();

            if (!lineItems.Any())
                throw new InvalidOperationException("No valid line items found");

            var grnId = lineItems.First().GrnId;

            if (lineItems.Any(x => x.GrnId != grnId))
                throw new InvalidOperationException("Line items must belong to the same GRN");

            var grn = await spaceLinxContext.GoodsReceiptNotes
                .Include(x => x.GrnLineItems)
                .Include(x => x.PurchaseOrder)
                    .ThenInclude(po => po!.PoLineItems)
                        .ThenInclude(pli => pli.Currency)
                .FirstAsync(x => x.Id == grnId && x.DeletedBy == null);

            foreach (var lineItem in lineItems)
            {
                lineItem.QcStatus = GrnLineItemStatus.Accepted;
                lineItem.UpdatedBy = UserEmail;
                lineItem.UpdatedAt = DateTime.UtcNow;

                var qty = lineItem.ReceivedQuantity ?? 0;

                var stock = await spaceLinxContext.InventoryStocks
                    .FirstOrDefaultAsync(x =>
                        x.PartId == lineItem.PartId &&
                        x.TrackingId == lineItem.TrackingId &&
                        x.DeletedBy == null);

                var oldQty = stock?.QtyOnhand ?? 0;
                var newQty = oldQty + qty;

                var poLineItem = grn.PurchaseOrder?.PoLineItems
                    .FirstOrDefault(l => l.Id == lineItem.PoLineItemId && l.DeletedBy == null);

                // opening_qty / opening_price hold the FROZEN fiscal-year opening balance
                // (seeded once at the 2026-04-01 anchor), NOT a running receipt total. The GRN
                // flow must not touch them: a post-anchor receipt already enters the report as a
                // 'purchase' ledger movement, so accumulating it here too would double-count
                // against the opening anchor in sc.inventory_stock_report.
                if (stock != null)
                {
                    stock.QtyQcPending = (stock.QtyQcPending) - qty;
                    stock.TrackingType = lineItem.TrackingMethod;
                    stock.TrackingId = lineItem.TrackingId;
                    stock.ProjectId = request.ProjectId ?? stock.ProjectId;
                    stock.Department = request.Department ?? stock.Department;
                    stock.AssignedUserId = request.AssignedUserId ?? stock.AssignedUserId;
                    stock.UpdatedBy = UserEmail;
                    stock.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    spaceLinxContext.InventoryStocks.Add(new InventoryStock
                    {
                        // A stock row first created by a post-anchor receipt has NO fiscal-year
                        // opening balance: opening_qty defaults to 0 (opening_price to null). Its
                        // quantity is reported as a 'purchase' movement, never as opening.
                        PartId = lineItem.PartId,
                        LocationId = grn.LocationId,
                        TrackingType = lineItem.TrackingMethod,
                        TrackingId = lineItem.TrackingId,
                        UnitPrice = poLineItem?.UnitPrice,
                        ConversionRate = poLineItem?.ConversionRate,
                        Currency = poLineItem?.Currency?.Code,
                        ProjectId = request.ProjectId,
                        Department = request.Department,
                        AssignedUserId = request.AssignedUserId,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    });
                }

                var part = await spaceLinxContext.InventoryParts
                    .FirstOrDefaultAsync(x => x.PartId == lineItem.PartId && x.LocationId == grn.LocationId && x.BinId == null && x.DeletedBy == null);

                if (part != null)
                {
                    part.QtyQcPending -= qty;
                    if (poLineItem?.UnitPrice != null)
                        part.UnitPrice = poLineItem.UnitPrice;
                    part.UpdatedBy = UserEmail;
                    part.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    spaceLinxContext.InventoryParts.Add(new InventoryPart
                    {
                        PartId = lineItem.PartId,
                        LocationId = grn.LocationId,
                        QtyOnhand = qty,
                        UnitPrice = poLineItem?.UnitPrice,
                        CreatedBy = UserEmail,
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    });
                }

                spaceLinxContext.InventoryTransactions.Add(new InventoryTransaction
                {
                    PartId = lineItem.PartId,
                    ToLocationId = grn.LocationId,
                    TransactionType = "Received",
                    PreviousQuantity = oldQty,
                    CurrentQuantity = newQty,
                    TransactedQuantity = qty,
                    ReferenceType = "GRN",
                    ReferenceId = grn.Id,
                    TrackingType = lineItem.TrackingMethod,
                    TrackingId = lineItem.TrackingId,
                    ProjectId = request.ProjectId,
                    Department = request.Department,
                    AssignedUserId = request.AssignedUserId,
                    TransactionDate = DateTime.UtcNow,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Notes = $"Inventory accepted for GRN line item {lineItem.Id}"
                });
            }

            await spaceLinxContext.SaveChangesAsync();
            await UpdateGrnStatusAsync(grn.Id.Value);

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task UpdateGrnStatusAsync(Guid grnId)
    {
        var grn = await spaceLinxContext.GoodsReceiptNotes
            .Include(x => x.GrnLineItems)
            .FirstAsync(x => x.Id == grnId && x.DeletedBy == null);

        var items = grn.GrnLineItems;

        bool hasPending = items.Any(x => x.QcStatus == GrnLineItemStatus.Pending);
        bool hasPass = items.Any(x => x.QcStatus == GrnLineItemStatus.Pass);
        bool hasFail = items.Any(x => x.QcStatus == GrnLineItemStatus.Fail);
        bool allAccepted = items.All(x => x.QcStatus == GrnLineItemStatus.Accepted);
        bool allPass = items.All(x => x.QcStatus == GrnLineItemStatus.Pass);
        bool allFail = items.All(x => x.QcStatus == GrnLineItemStatus.Fail);

        if (hasPending)
            grn.Status = GrnStatus.InProcess;
        else if (allAccepted)
            grn.Status = GrnStatus.Closed;
        else if (allPass)
            grn.Status = GrnStatus.Completed;
        else if (allFail || (hasPass && hasFail))
            grn.Status = GrnStatus.Completed;

        grn.UpdatedBy = UserEmail;
        grn.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
    }
}
