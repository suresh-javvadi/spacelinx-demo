using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IStockMovementService
{
    Task<StockMovement> CreateStockMovementAsync(StockMovementWithLineItemsWriteModel request);
    Task<StockMovement> SubmitStockMovementAsync(StockMovementWithLineItemsWriteModel request);
    Task<bool> ApproveStockMovementAsync(Guid id);
    Task<bool> RejectStockMovementAsync(Guid id);
    Task<bool> CancelStockMovementAsync(Guid id);
}