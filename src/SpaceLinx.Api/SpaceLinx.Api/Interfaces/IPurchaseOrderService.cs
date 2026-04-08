using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;

public interface IPurchaseOrderService
{
    Task<PurchaseOrder> CreateFromRequisitionAsync(Guid requisitionId, CreatePurchaseOrderFromRequisitionModel model);
}
