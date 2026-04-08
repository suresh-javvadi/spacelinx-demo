using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces;
using Task = System.Threading.Tasks.Task;

public interface IGoodsReceiptNoteService
{
    Task<GoodsReceiptNote> CreateGrnAsync(GrnWithLineItemWriteModel request);
    Task UpdateGrnLineItemQcAsync(List<GrnLineItemQcAlterModel> records);
    Task AcceptGrnLineItemsAsync(GrnLineItemsAcceptModel request);
}
