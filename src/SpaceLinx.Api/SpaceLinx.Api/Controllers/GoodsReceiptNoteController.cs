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
public class GoodsReceiptNoteController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IGoodsReceiptNoteService goodsReceiptNoteService, IDocumentService documentService) :
    GenericRestController<GoodsReceiptNote, GoodsReceiptNoteWriteModel, GoodsReceiptNoteUpdateModel, GoodsReceiptNoteReadModel, GoodsReceiptNoteRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [HttpGet("grn-with-user")]
    public async Task<IActionResult> GetGrn()
    {
        var result = await spaceLinxContext.GrnWithUserVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("by-purchase-order/{purchaseOrderId}")]
    public async Task<IActionResult> GetGrnDetailsByPurchaseOrderId(Guid purchaseOrderId)
    {
        var result = await spaceLinxContext.GrnsByPurchaseOrderVws
            .AsNoTracking()
            .Where(x => x.PurchaseOrderId == purchaseOrderId)
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var grnEntity = await spaceLinxContext.GoodsReceiptNotes
                .AsNoTracking()
                .Include(g => g.GrnLineItems)
                    .ThenInclude(li => li.Part)
                .Include(g => g.GrnLineItems)
                    .ThenInclude(li => li.PoLineItem)
                .FirstOrDefaultAsync(g => g.Id == id && g.DeletedBy == null);

        if (grnEntity == null)
        {
            return NotFound();
        }

        var grn = mapper.Map<GoodsReceiptNoteDetailsReadModel>(grnEntity);

        return Ok(grn);
    }

    [HttpPost("grn-with-line-items")]
    public async Task<IActionResult> CreateGrnWithLineItems([FromForm] GrnWithLineItemWriteModel grnWriteModel)
    {
        var createdGrn = await goodsReceiptNoteService.CreateGrnAsync(grnWriteModel);

        if (createdGrn is null)
        {
            return BadRequest("Failed to create GRN. Please check the purchase order and received quantities.");
        }

        return CreatedAtAction(nameof(Get), new { id = createdGrn.Id }, createdGrn);
    }

    [HttpPut("grn-details-update/{id}")]
    public async Task<IActionResult> UpdateGrn(Guid id, [FromForm] GrnAlterModel grnDetails, [FromForm] IEnumerable<DocumentCreateModel> documents)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var grnRecord = await spaceLinxContext.GoodsReceiptNotes
                .Include(x => x.GrnLineItems)
                .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

            if (grnRecord == null)
                return NotFound();

            if (grnRecord.Status == GrnStatus.QualityChecked)
            {
                return BadRequest("GRN cannot be modified after Quality Check.");
            }

            grnRecord.PurchaseOrderId = grnDetails.PurchaseOrderId;
            grnRecord.ReceivedById = grnDetails.ReceivedById;
            grnRecord.Description = grnDetails.Description;
            grnRecord.ReceivedDate = grnDetails.ReceivedDate;
            grnRecord.ReferenceNumber = grnDetails.ReferenceNumber;
            grnRecord.InvoiceNumber = grnDetails.InvoiceNumber;
            grnRecord.InvoiceDate = grnDetails.InvoiceDate;
            grnRecord.VendorReferenceId = grnDetails.VendorReferenceId;
            grnRecord.LocationId = grnDetails.LocationId;
            grnRecord.VendorId = grnDetails.VendorId;
            grnRecord.UpdatedBy = UserEmail;
            grnRecord.UpdatedAt = DateTime.UtcNow;

            spaceLinxContext.GoodsReceiptNotes.Update(grnRecord);

            var effectedPartIds = new HashSet<Guid>();
            var now = DateTime.UtcNow;

            if (grnDetails.GrnLineItems != null && grnDetails.GrnLineItems.Any())
            {
                foreach (var item in grnDetails.GrnLineItems)
                {
                    var existingLineItem = await spaceLinxContext.GrnLineItems
                        .FirstOrDefaultAsync(li => li.Id == item.Id && li.GrnId == grnRecord.Id && li.DeletedBy == null);

                    if (existingLineItem != null)
                    {
                        var oldQty = existingLineItem.ReceivedQuantity;
                        var quantityDiff = item.ReceivedQuantity - oldQty;

                        existingLineItem.PartId = item.PartId;
                        existingLineItem.ReceivedQuantity = item.ReceivedQuantity;
                        existingLineItem.Remark = item.Remark;
                        existingLineItem.UpdatedBy = UserEmail;
                        existingLineItem.UpdatedAt = now;

                        spaceLinxContext.GrnLineItems.Update(existingLineItem);

                        if (grnRecord.PurchaseOrderId != null)
                        {
                            var poLineItem = await spaceLinxContext.PoLineItems
                            .FirstOrDefaultAsync(po => po.PurchaseOrderId == grnRecord.PurchaseOrderId && po.PartId == item.PartId && po.DeletedBy == null);

                            if (poLineItem != null)
                            {
                                poLineItem.ReceivedQuantity += quantityDiff ?? 0;
                                poLineItem.PendingQuantity = poLineItem.OrderedQuantity - (poLineItem.ReceivedQuantity ?? 0);
                                poLineItem.UpdatedBy = UserEmail;
                                poLineItem.UpdatedAt = now;

                                spaceLinxContext.PoLineItems.Update(poLineItem);
                            }

                            var purchaseOrder = await spaceLinxContext.PurchaseOrders
                            .Include(po => po.PoLineItems)
                            .FirstOrDefaultAsync(po => po.Id == grnRecord.PurchaseOrderId && po.DeletedBy == null);

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

                        if (quantityDiff != 0)
                        {
                            spaceLinxContext.InventoryTransactions.Add(new InventoryTransaction
                            {
                                PartId = item.PartId,
                                FromLocationId = grnDetails.LocationId,
                                ToLocationId = grnDetails.LocationId,
                                TransactionType = "Adjustment",
                                PreviousQuantity = oldQty,
                                CurrentQuantity = item.ReceivedQuantity,
                                TransactedQuantity = quantityDiff.Value,
                                TransactionDate = now,
                                CreatedBy = UserEmail,
                                CreatedAt = now,
                                IsActive = true,
                                Notes = $"Updated quantity to {item.ReceivedQuantity}."
                            });
                        }
                    }
                    effectedPartIds.Add(item.PartId);
                }
            }

            if (documents != null)
            {
                foreach (var doc in documents)
                {
                    doc.EntityId = id;
                    doc.EntityType = SpaceLinxEntities.GoodsReceiptNote;

                    await documentService.SaveDocumentAsync(doc);
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

    [HttpPut("grn-line-item-qc")]
    public async Task<IActionResult> UpdateGrnLineItemQc([FromBody] List<GrnLineItemQcAlterModel> records)
    {
        await goodsReceiptNoteService.UpdateGrnLineItemQcAsync(records);

        return NoContent();
    }

    [HttpPut("accept-line-items")]
    public async Task<IActionResult> AcceptLineItems([FromBody] GrnLineItemsAcceptModel request)
    {
        await goodsReceiptNoteService.AcceptGrnLineItemsAsync(request);

        return NoContent();
    }

    [HttpPut("quality-checked/{id}")]
    public async Task<IActionResult> QualityChecked(Guid id)
    {
        var grnRecord = await spaceLinxContext.GoodsReceiptNotes
                .Include(x => x.GrnLineItems)
                .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (grnRecord == null)
        {
            return NotFound();
        }

        if (grnRecord.GrnLineItems.Any(x => x.QcStatus == "Pending" || x.QcStatus == "Quarantine"))
        {
            return BadRequest("All items must be QC completed before finalizing GRN.");
        }

        foreach (var line in grnRecord.GrnLineItems)
        {
            var stock = await spaceLinxContext.InventoryStocks
                .FirstOrDefaultAsync(s => s.PartId == line.PartId && s.LocationId == grnRecord.LocationId && s.DeletedBy == null);

            var oldQty = stock?.QtyOnhand ?? 0;
            var transactedQty = line.ReceivedQuantity ?? 0;
            var newQty = oldQty + transactedQty;

            if (stock != null)
            {
                stock.QtyOnhand = newQty;
                stock.QtyAvailable = (stock.QtyAvailable) + transactedQty;
                stock.TrackingType = line.TrackingMethod;
                stock.TrackingId = line.TrackingId;
                stock.UpdatedBy = UserEmail;
                stock.UpdatedAt = DateTime.UtcNow;

                spaceLinxContext.InventoryStocks.Update(stock);
            }
            else
            {
                spaceLinxContext.InventoryStocks.Add(new InventoryStock
                {
                    PartId = line.PartId,
                    LocationId = grnRecord.LocationId,
                    QtyOnhand = newQty,
                    QtyAvailable = transactedQty,
                    TrackingType = line.TrackingMethod,
                    TrackingId = line.TrackingId,
                    CreatedBy = UserEmail,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                });
            }

            var part = await spaceLinxContext.InventoryParts
                .FirstOrDefaultAsync(p => p.PartId == line.PartId && p.LocationId == grnRecord.LocationId && p.BinId == null && p.DeletedBy == null);

            if (part != null)
            {
                part.QtyOnhand += transactedQty;
                part.QtyAvailable = (part.QtyAvailable ?? 0) + transactedQty;
                part.UpdatedAt = DateTime.UtcNow;
                part.UpdatedBy = UserEmail;
                spaceLinxContext.InventoryParts.Update(part);
            }
            else
            {
                var newPart = new InventoryPart
                {
                    PartId = line.PartId,
                    LocationId = grnRecord.LocationId,
                    QtyOnhand = transactedQty,
                    QtyAvailable = transactedQty,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = UserEmail,
                    IsActive = true
                };
                spaceLinxContext.InventoryParts.Add(newPart);
            }

            spaceLinxContext.InventoryTransactions.Add(new InventoryTransaction
            {
                PartId = line.PartId,
                ToLocationId = grnRecord.LocationId,
                TransactionType = "Received",
                PreviousQuantity = oldQty,
                CurrentQuantity = newQty,
                TransactedQuantity = transactedQty,
                ReferenceType = "GRN",
                ReferenceId = grnRecord.Id,
                TrackingType = line.TrackingMethod,
                TrackingId = line.TrackingId,
                TransactionDate = DateTime.UtcNow,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                Notes = $"{transactedQty} quantity finalized after QC"
            });

            await spaceLinxContext.SaveChangesAsync();
        }

        grnRecord.Status = GrnStatus.QualityChecked;
        grnRecord.UpdatedBy = UserEmail;
        grnRecord.UpdatedAt = DateTime.UtcNow;

        spaceLinxContext.GoodsReceiptNotes.Update(grnRecord);
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("reject/{id}")]
    public async Task<IActionResult> Reject(Guid id)
    {
        var record = await spaceLinxContext.GoodsReceiptNotes
                      .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        record.Status = GrnStatus.Rejected;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }
}