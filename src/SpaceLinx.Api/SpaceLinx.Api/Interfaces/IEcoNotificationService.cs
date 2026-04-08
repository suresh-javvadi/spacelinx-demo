namespace SpaceLinx.Api.Interfaces;

public interface IEcoNotificationService
{
    /// <summary>
    /// Send notification when ECO is submitted for approval.
    /// </summary>
    Task NotifyEcoSubmittedAsync(Guid ecoId);

    /// <summary>
    /// Send notification when ECO is fully approved.
    /// </summary>
    Task NotifyEcoApprovedAsync(Guid ecoId);

    /// <summary>
    /// Send notification when ECO is rejected.
    /// </summary>
    Task NotifyEcoRejectedAsync(Guid ecoId, string rejectorEmail, string? notes);

    /// <summary>
    /// Send notification when ECO is released.
    /// </summary>
    Task NotifyEcoReleasedAsync(Guid ecoId);
}
