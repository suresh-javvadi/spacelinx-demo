namespace SpaceLinx.Api.Interfaces
{
    public interface IInventoryNotificationService
    {
        Task NotifyReorderLevelAsync(Guid inventoryPartId);
    }
}
