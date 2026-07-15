using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Services;

public class StockMovementService(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor contextAccessor, IInventoryNotificationService inventoryNotificationService)
    : BaseService(spaceLinxContext, contextAccessor), IStockMovementService
{
    public async Task<StockMovement> CreateStockMovementAsync(StockMovementWithLineItemsWriteModel request)
    {
        // If Id is provided, update existing stock movement with Draft status
        if (request.Id != null)
        {
            return await UpdateStockMovementAsync(request, StockMovementStatus.Draft);
        }
        
        return await CreateNewStockMovementAsync(request, StockMovementStatus.Draft);
    }
        
    private async Task<StockMovement> CreateNewStockMovementAsync(StockMovementWithLineItemsWriteModel request, string status)
    {        
        // Validate movement type
        if (request.MovementType != StockMovementType.Transfer &&
            request.MovementType != StockMovementType.Adjustment &&
            request.MovementType != StockMovementType.Issued &&
            request.MovementType != StockMovementType.Reserved &&
            request.MovementType != StockMovementType.Consumed)
        {
                throw new InvalidOperationException($"Invalid movement type: {request.MovementType}. Must be Transfer, Adjustment, Reserved, Consumed or Issued.");
        }

        if (request.LineItems == null || !request.LineItems.Any())
        {
            throw new InvalidOperationException("At least one line item is required.");
        }

            // Get user for performed by
            var user = await spaceLinxContext.Users.FirstOrDefaultAsync(x => x.Email == UserEmail && x.DeletedBy == null);

            // Create stock movement header
        var stockMovement = new StockMovement
        {
            MovementType = request.MovementType,
            MovementReason = request.MovementReason,
            MovementDate = request.MovementDate,
            FromLocationId = request.FromLocationId,
            FromBinId = request.FromBinId,
            ToLocationId = request.ToLocationId,
            ToBinId = request.ToBinId,
            ProjectId = request.ProjectId,
            SubProjectId = request.SubProjectId,
            Department = request.Department,
            AssignedUserId = request.AssignedUserId,
            IssuePurpose = request.IssuePurpose,
            CompanyId = request.CompanyId,
            PerformedById = request.PerformedById ?? user?.Id,
            WorkOrderId = request.WorkOrderId,
            ReferenceNumber = request.ReferenceNumber,
            Notes = request.Notes,
            Status = status,
            ExpectedReturnDate = request.ExpectedReturnDate,
            ProjectDate = request.ProjectDate,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = UserEmail,
            IsActive = true
        };

        spaceLinxContext.StockMovements.Add(stockMovement);
        await spaceLinxContext.SaveChangesAsync();

            // Create line items for the stock movement request
        foreach (var item in request.LineItems)
        {
                // Validate part exists
                var part = await spaceLinxContext.Parts.FirstOrDefaultAsync(p => p.Id == item.PartId && p.DeletedBy == null);
            if (part == null)
            {
                throw new InvalidOperationException($"Part with ID {item.PartId} not found.");
            }

            if (item.Quantity <= 0)
            {
                    throw new InvalidOperationException($"Quantity must be positive for Part ID {item.PartId}.");
            }

                // Create line item
            var lineItem = new StockMovementLineItem
            {
                StockMovementId = stockMovement.Id!.Value,
                PartId = item.PartId,
                Quantity = item.Quantity,
                TrackingType = item.TrackingType,
                TrackingId = item.TrackingId,
                Reason = item.Reason,
                Notes = item.Notes,
                AdjustmentType = item.AdjustmentType,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            spaceLinxContext.StockMovementLineItems.Add(lineItem);
        }

        await spaceLinxContext.SaveChangesAsync();
        return stockMovement;
    }

    private async System.Threading.Tasks.Task ProcessTransfer(StockMovementWithLineItemsWriteModel request, StockMovementLineItemWriteModel item,
        InventoryStock? sourceStock, InventoryPart? inventoryPart, int previousQty)
    {
        // Validate sufficient quantity
        if (sourceStock == null || sourceStock.QtyOnhand < item.Quantity)
        {
            throw new InvalidOperationException($"Insufficient stock for Part ID {item.PartId}. Available: {sourceStock?.QtyOnhand ?? 0}, Requested: {item.Quantity}");
        }

        // Decrement source stock
        sourceStock.QtyOnhand -= item.Quantity;
        sourceStock.ProjectId = request.ProjectId;
        sourceStock.Department = request.Department;
        sourceStock.AssignedUserId = request.AssignedUserId;
        sourceStock.UpdatedBy = UserEmail;
        sourceStock.UpdatedAt = DateTime.UtcNow;

        // Get or create destination stock
        var destStock = await spaceLinxContext.InventoryStocks
            .FirstOrDefaultAsync(s => s.PartId == item.PartId
                && s.TrackingId == item.TrackingId
                && s.DeletedBy == null);

        if (destStock == null)
        {
            destStock = new InventoryStock
            {
                PartId = item.PartId,
                LocationId = request.ToLocationId,
                BinId = request.ToBinId,
                TrackingType = item.TrackingType,
                TrackingId = item.TrackingId,
                QtyOnhand = 0,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            spaceLinxContext.InventoryStocks.Add(destStock);
        }

        destStock.QtyOnhand += item.Quantity;
        destStock.ProjectId = request.ProjectId;
        destStock.Department = request.Department;
        destStock.AssignedUserId = request.AssignedUserId;
        destStock.UpdatedBy = UserEmail;
        destStock.UpdatedAt = DateTime.UtcNow;

        // InventoryPart.QtyOnhand stays the same for transfers
    }

    private async System.Threading.Tasks.Task ProcessAdjustment(StockMovementWithLineItemsWriteModel request, StockMovementLineItemWriteModel item,
        InventoryStock? sourceStock, InventoryPart? inventoryPart, int previousQty)
    {
        // For adjustment, we add or subtract from the location
        if (sourceStock == null)
        {
            sourceStock = new InventoryStock
            {
            PartId = item.PartId,
            LocationId = request.FromLocationId,
            BinId = request.FromBinId,
            TrackingType = item.TrackingType,
            TrackingId = item.TrackingId,
            QtyOnhand = 0,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
            spaceLinxContext.InventoryStocks.Add(sourceStock);
        }

        // For adjustment, positive quantity adds stock, use negative quantity to reduce
        // But since our model requires positive quantity, we use the reason to determine direction
        // Actually, let's always add for now (positive adjustment)
        if (item.AdjustmentType == AdjustmentType.Increase)
        {
            sourceStock.QtyOnhand += item.Quantity;
        }
        else
        {
            sourceStock.QtyOnhand -= item.Quantity;
        }

        sourceStock.UpdatedBy = UserEmail;
        sourceStock.UpdatedAt = DateTime.UtcNow;

        // Update InventoryPart
        if (inventoryPart == null)
        {
            inventoryPart = new InventoryPart
            {
            PartId = item.PartId,
            LocationId = request.FromLocationId,
            BinId = request.FromBinId,
            QtyOnhand = 0,
            QtyReserved = 0,
            ConsumedQuantity = 0,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
            spaceLinxContext.InventoryParts.Add(inventoryPart);
        }

        if (item.AdjustmentType == AdjustmentType.Increase)
        {
            inventoryPart.QtyOnhand += item.Quantity;
        }
        else
        {
            inventoryPart.QtyOnhand -= item.Quantity;
        }

        inventoryPart.UpdatedBy = UserEmail;
        inventoryPart.UpdatedAt = DateTime.UtcNow;
    }

    private async System.Threading.Tasks.Task ProcessIssue(StockMovementWithLineItemsWriteModel request, StockMovementLineItemWriteModel item,
        InventoryStock? sourceStock, InventoryPart? inventoryPart, int previousQty)
    {
        if (sourceStock.QtyReserved >= item.Quantity)
        {
            sourceStock.QtyReserved -= item.Quantity;
        }
        else
        {
            sourceStock.QtyReserved = 0;
        }
        sourceStock.QtyIssued += item.Quantity;
        sourceStock.ProjectId = request.ProjectId;
        sourceStock.Department = request.Department;
        sourceStock.AssignedUserId = request.AssignedUserId;
        sourceStock.UpdatedBy = UserEmail;
        sourceStock.UpdatedAt = DateTime.UtcNow;

        // Update InventoryPart
        if (inventoryPart != null)
        {
            if (inventoryPart.QtyReserved >= item.Quantity)
            {
                inventoryPart.QtyReserved -= item.Quantity;
            }
            else
            {
                inventoryPart.QtyReserved = 0;
            }
            inventoryPart.QtyIssued += item.Quantity;
            inventoryPart.UpdatedBy = UserEmail;
            inventoryPart.UpdatedAt = DateTime.UtcNow;
        }
    }

    private async System.Threading.Tasks.Task ProcessReserve(StockMovementWithLineItemsWriteModel request, StockMovementLineItemWriteModel item,
        InventoryStock? sourceStock, InventoryPart? inventoryPart, int previousQty)
    {
        if (inventoryPart == null)
        {
            throw new InvalidOperationException($"InventoryPart not found for Part ID {item.PartId}");
        }

        if (sourceStock == null)
        {
            throw new InvalidOperationException($"InventoryStock not found for Part ID {item.PartId}");
        }

        int availableQty = inventoryPart.QtyOnhand - inventoryPart.QtyReserved;

        if (availableQty < item.Quantity)
        {
            throw new InvalidOperationException($"Insufficient available quantity to reserve for Part ID {item.PartId}");
        }

        // Update InventoryStock
        sourceStock.QtyReserved += item.Quantity;
        sourceStock.ProjectId = request.ProjectId;
        sourceStock.Department = request.Department;
        sourceStock.AssignedUserId = request.AssignedUserId;
        sourceStock.UpdatedBy = UserEmail;
        sourceStock.UpdatedAt = DateTime.UtcNow;

        // Update InventoryPart
        inventoryPart.QtyReserved += item.Quantity;
        inventoryPart.UpdatedBy = UserEmail;
        inventoryPart.UpdatedAt = DateTime.UtcNow;
    }

    private async System.Threading.Tasks.Task ProcessConsume(StockMovementWithLineItemsWriteModel request, StockMovementLineItemWriteModel item,
        InventoryStock? sourceStock, InventoryPart? inventoryPart, int previousQty)
    {
        if ((sourceStock.QtyIssued + sourceStock.QtyReserved + sourceStock.QtyAvailable) < item.Quantity)
        {
            throw new InvalidOperationException(
                $"Insufficient quantity for Part ID {item.PartId}. " +
                $"Available: {sourceStock.QtyIssued + sourceStock.QtyReserved + sourceStock.QtyAvailable}, " +
                $"Requested: {item.Quantity}");
        }

        int originalQtyIssued = sourceStock.QtyIssued ?? 0;
        int originalQtyReserved = sourceStock.QtyReserved ?? 0;

        sourceStock.QtyIssued = originalQtyIssued - item.Quantity;
        if (sourceStock.QtyIssued < 0)
        {
            sourceStock.QtyReserved += sourceStock.QtyIssued.Value;
            sourceStock.QtyIssued = 0;
        }

        if (sourceStock.QtyReserved < 0)
            sourceStock.QtyReserved = 0;

        int issuedStockDeducted = originalQtyIssued - (sourceStock.QtyIssued ?? 0);
        int reservedStockDeducted = originalQtyReserved - (sourceStock.QtyReserved ?? 0);

        sourceStock.QtyOnhand -= item.Quantity;
        sourceStock.QtyConsumed += item.Quantity;
        sourceStock.ProjectId = request.ProjectId;
        sourceStock.Department = request.Department;
        sourceStock.AssignedUserId = request.AssignedUserId;
        sourceStock.UpdatedBy = UserEmail;
        sourceStock.UpdatedAt = DateTime.UtcNow;

        // InventoryPart updates
        inventoryPart.QtyIssued -= issuedStockDeducted;
        inventoryPart.QtyReserved -= reservedStockDeducted;
        inventoryPart.QtyOnhand -= item.Quantity;
        inventoryPart.ConsumedQuantity += item.Quantity;
        inventoryPart.UpdatedBy = UserEmail;
        inventoryPart.UpdatedAt = DateTime.UtcNow;
    }

    private async Task<StockMovement> UpdateStockMovementAsync(StockMovementWithLineItemsWriteModel request, string status)
    {
        if (request.Id == null)
        {
            throw new InvalidOperationException("Stock Movement ID is required for update.");
        }

        var stockMovement = await spaceLinxContext.StockMovements
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.DeletedBy == null);

        if (stockMovement == null)
        {
                throw new InvalidOperationException($"Stock Movement with ID {request.Id} not found.");
        }

        if (request.LineItems == null || !request.LineItems.Any())
        {
            throw new InvalidOperationException("At least one line item is required.");
        }

            // Get user for performed by
            var user = await spaceLinxContext.Users.FirstOrDefaultAsync(x => x.Email == UserEmail && x.DeletedBy == null);

            // Update stock movement header
        stockMovement.MovementType = request.MovementType;
        stockMovement.MovementReason = request.MovementReason;
        stockMovement.MovementDate = request.MovementDate;
        stockMovement.FromLocationId = request.FromLocationId;
        stockMovement.FromBinId = request.FromBinId;
        stockMovement.ToLocationId = request.ToLocationId;
        stockMovement.ToBinId = request.ToBinId;
        stockMovement.ProjectId = request.ProjectId;
        stockMovement.SubProjectId = request.SubProjectId;
        stockMovement.Department = request.Department;
        stockMovement.AssignedUserId = request.AssignedUserId;
        stockMovement.IssuePurpose = request.IssuePurpose;
        stockMovement.CompanyId = request.CompanyId;
        stockMovement.PerformedById = request.PerformedById ?? user?.Id;
        stockMovement.WorkOrderId = request.WorkOrderId;
        stockMovement.ReferenceNumber = request.ReferenceNumber;
        stockMovement.Notes = request.Notes;
        stockMovement.ExpectedReturnDate = request.ExpectedReturnDate;
        stockMovement.ProjectDate = request.ProjectDate;
        stockMovement.Status = status;
        stockMovement.UpdatedBy = UserEmail;
        stockMovement.UpdatedAt = DateTime.UtcNow;

            // Remove all existing line items for this stock movement
        var existingLineItems = await spaceLinxContext.StockMovementLineItems
            .Where(li => li.StockMovementId == request.Id)
            .ToListAsync();

        spaceLinxContext.StockMovementLineItems.RemoveRange(existingLineItems);

            // Insert new line items from payload
        foreach (var item in request.LineItems)
        {
            var lineItem = new StockMovementLineItem
            {
                StockMovementId = request.Id.Value,
                PartId = item.PartId,
                Quantity = item.Quantity,
                TrackingType = item.TrackingType,
                TrackingId = item.TrackingId,
                Reason = item.Reason,
                Notes = item.Notes,
                AdjustmentType = item.AdjustmentType,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            spaceLinxContext.StockMovementLineItems.Add(lineItem);
        }

        await spaceLinxContext.SaveChangesAsync();
        return stockMovement;
    }

    public async Task<StockMovement> SubmitStockMovementAsync(StockMovementWithLineItemsWriteModel request)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();

        try
        {
            StockMovement stockMovement;

            if (request.Id == null)
            {
                stockMovement = await CreateNewStockMovementAsync(request, StockMovementStatus.Submitted);
            }
            else
            {
                stockMovement = await UpdateStockMovementAsync(request, StockMovementStatus.Submitted);
            }

            stockMovement = await spaceLinxContext.StockMovements
                .Include(m => m.StockMovementLineItems)
                .FirstAsync(m => m.Id == stockMovement.Id);

            await ProcessInventoryAsync(stockMovement);

            await spaceLinxContext.SaveChangesAsync();

            foreach (var line in stockMovement.StockMovementLineItems)
            {
                var inventoryPart = await spaceLinxContext.InventoryParts
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.PartId == line.PartId && p.DeletedBy == null);

                if (inventoryPart != null)
                {
                    await inventoryNotificationService.NotifyReorderLevelAsync(inventoryPart.Id.Value);
                }
            }
            await transaction.CommitAsync();

            return stockMovement;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task ProcessInventoryAsync(StockMovement stockMovement)

    {
        if (stockMovement.StockMovementLineItems == null || !stockMovement.StockMovementLineItems.Any())
        {
            throw new InvalidOperationException("Stock Movement has no line items.");
        }

        var request = new StockMovementWithLineItemsWriteModel
        {
            Id = stockMovement.Id,
            MovementType = stockMovement.MovementType,
            MovementReason = stockMovement.MovementReason,
            FromLocationId = stockMovement.FromLocationId,
            FromBinId = stockMovement.FromBinId,
            ToLocationId = stockMovement.ToLocationId,
            ToBinId = stockMovement.ToBinId,
            ProjectId = stockMovement.ProjectId,
            Department = stockMovement.Department,
            AssignedUserId = stockMovement.AssignedUserId,
        };

        foreach (var lineItem in stockMovement.StockMovementLineItems)
        {
            var item = new StockMovementLineItemWriteModel
            {
                PartId = lineItem.PartId,
                Quantity = lineItem.Quantity,
                TrackingType = lineItem.TrackingType,
                TrackingId = lineItem.TrackingId,
                AdjustmentType = lineItem.AdjustmentType
            };

                // Validate part exists
                var part = await spaceLinxContext.Parts.FirstOrDefaultAsync(p => p.Id == item.PartId && p.DeletedBy == null);
            if (part == null)
            {
                throw new InvalidOperationException($"Part with ID {item.PartId} not found.");
            }

                // Get inventory stock at source location
            var sourceStock = await spaceLinxContext.InventoryStocks
                    .FirstOrDefaultAsync(s => s.PartId == item.PartId
                        && s.TrackingId == item.TrackingId
                        && s.DeletedBy == null);

                // Get inventory part
            var inventoryPart = await spaceLinxContext.InventoryParts
                    .FirstOrDefaultAsync(p => p.PartId == item.PartId && p.LocationId == request.FromLocationId && p.BinId == request.FromBinId && p.DeletedBy == null);

            int previousQty = sourceStock?.QtyOnhand ?? 0;

                // Process based on movement type
            switch (stockMovement.MovementType)
            {
                case StockMovementType.Transfer:
                    await ProcessTransfer(request, item, sourceStock, inventoryPart, previousQty);
                    break;

                case StockMovementType.Adjustment:
                    await ProcessAdjustment(request, item, sourceStock, inventoryPart, previousQty);
                    break;

                case StockMovementType.Issued:
                    await ProcessIssue(request, item, sourceStock, inventoryPart, previousQty);
                    break;

                case StockMovementType.Reserved:
                    await ProcessReserve(request, item, sourceStock, inventoryPart, previousQty);
                    break;

                case StockMovementType.Consumed:
                    await ProcessConsume(request, item, sourceStock, inventoryPart, previousQty);
                    break;
            }

                // Create inventory transaction audit record
            var invTransaction = new InventoryTransaction
            {
                PartId = item.PartId,
                FromLocationId = stockMovement.MovementType == StockMovementType.Adjustment ? null : stockMovement.FromLocationId,
                ToLocationId = stockMovement.MovementType == StockMovementType.Transfer ? stockMovement.ToLocationId : null,
                TransactionType = stockMovement.MovementType,
                PreviousQuantity = previousQty,
                CurrentQuantity = sourceStock?.QtyOnhand ?? 0,
                TransactedQuantity = item.Quantity,
                ReferenceType = "StockMovement",
                ReferenceId = stockMovement.Id,
                TransactionDate = DateTime.UtcNow,
                Notes = $"{stockMovement.MovementType}: {item.Quantity} qty - {stockMovement.MovementReason ?? "No reason specified"} (Submitted)",
                TrackingType = item.TrackingType,
                TrackingId = item.TrackingId,
                ProjectId = stockMovement.ProjectId,
                Department = stockMovement.Department,
                AssignedUserId = stockMovement.AssignedUserId,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            spaceLinxContext.InventoryTransactions.Add(invTransaction);
        }

    }

    public async Task<bool> ApproveStockMovementAsync(Guid id)
    {
        var movement = await spaceLinxContext.StockMovements
            .FirstOrDefaultAsync(m => m.Id == id && m.DeletedBy == null);

        if (movement == null)
        {
            return false;
        }

        movement.Status = StockMovementStatus.Approved;
        movement.UpdatedBy = UserEmail;
        movement.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RejectStockMovementAsync(Guid id)
    {
        var movement = await spaceLinxContext.StockMovements
            .FirstOrDefaultAsync(m => m.Id == id && m.DeletedBy == null);

        if (movement == null)
        {
            return false;
        }

        if (movement.Status != StockMovementStatus.PendingApproval)
        {
            return false;
        }

        movement.Status = StockMovementStatus.Rejected;
        movement.UpdatedBy = UserEmail;
        movement.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CancelStockMovementAsync(Guid id)
    {
            var movement = await spaceLinxContext.StockMovements
                .FirstOrDefaultAsync(m => m.Id == id && m.DeletedBy == null);

        if (movement == null)
        {
            return false;
        }

        if (movement.Status == StockMovementStatus.Cancelled)
        {
            return false;
        }

        movement.Status = StockMovementStatus.Cancelled;
        movement.UpdatedBy = UserEmail;
        movement.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();
        return true;
    }
}
