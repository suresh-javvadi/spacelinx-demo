using SpaceLinx.Model;
namespace SpaceLinx.Api.Interfaces
{
    public interface IWorkOrderService
    {
        Task<WorkOrderReadModel> GetByNumberAsync(string number);
        Task<WorkOrderReadModel> GetAsync(Guid id);
        Task<WorkOrderDetailReadModel> GetWorkOrderDetailsAsync(Guid id);
        Task<List<object>> GetByWorkPackageAsync(Guid workPackageId);
        Task<List<WorkOrderReadModel>> GetByPartAsync(Guid partId);
        Task<List<WorkOrderReadModel>> GetByProductAndPartAsync(Guid productId, Guid partId);
        Task<List<object>> WorkOrdersWithTechnicianAssignedAsync();
        Task<List<object>> WorkorderguidestepsviewAsync(Guid workOrderId);
    }
}