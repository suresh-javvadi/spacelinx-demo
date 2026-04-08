using Microsoft.AspNetCore.Mvc;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Interfaces
{
    public interface IEcoService
    {
        Task<IActionResult> UpdateApproverStatusToApprove(Guid ecoEntityId, string? comment, string userEmail);
        Task<Eco> UpdateStatus(Guid ecoEntityId, string newStatus);
    }
}