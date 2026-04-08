using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Model;

namespace SpaceLinx.Api.Services
{
    public class EcoService(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor _contextAccessor,
        IEcoNotificationService ecoNotificationService,
        IPartCacheService partCacheService)
        : BaseService(spaceLinxContext, _contextAccessor), IEcoService
    {
        public async Task<IActionResult> UpdateApproverStatusToApprove(Guid ecoEntityId, string? comment, string userEmail)
        {
            var record = await spaceLinxContext.Ecos
                .FirstOrDefaultAsync(x => x.Id == ecoEntityId && x.DeletedBy == null);

            if (record == null)
                return new NotFoundResult();

            if (record.Status != EcoStatus.Submitted)
                throw new ApplicationException("Eco must be in Submitted status to Approve");

            var user = await spaceLinxContext.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail.ToLower());

            var approver = await spaceLinxContext.Approvals
                .FirstOrDefaultAsync(a => a.EntityType == SpaceLinxEntities.Eco &&
                                          a.EntityId == ecoEntityId &&
                                          a.ApproverId == user.Id &&
                                          a.DeletedBy == null);

            if (approver == null)
                return new NotFoundObjectResult("Approver not found");

            approver.Status = ApprovalStatus.Approved;
            approver.Comment = comment;
            approver.ActedAt = DateTime.UtcNow;
            approver.UpdatedBy = userEmail;
            approver.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();

            var approvals = await spaceLinxContext.Approvals
                .Where(a => a.EntityType == SpaceLinxEntities.Eco &&
                            a.EntityId == ecoEntityId &&
                            a.DeletedBy == null)
                .ToListAsync();

            if (approvals.All(a => a.Status == ApprovalStatus.Approved))
                using (var transaction = await spaceLinxContext.Database.BeginTransactionAsync())
                {
                    try
                    {
                        record.Status = EcoStatus.Approved;
                        record.ApprovedDate = DateTime.UtcNow;
                        record.ApprovedBy = UserEmail;
                        await spaceLinxContext.SaveChangesAsync();

                        await spaceLinxContext.Database.ExecuteSqlRawAsync("CALL mes.release_eco({0}, {1})", ecoEntityId, UserEmail);

                        await partCacheService.InvalidateUniquePartsCacheAsync();

                        var ecoLog = new EcoLog
                        {
                            EcoId = record.Id.Value,
                            Action = EcoStatus.Approved,
                            ActionBy = UserEmail,
                            ActionAt = DateTime.UtcNow,
                            IsActive = true,
                            CreatedBy = UserEmail,
                            CreatedAt = DateTime.UtcNow
                        };

                        await spaceLinxContext.EcoLogs.AddAsync(ecoLog);
                        await spaceLinxContext.SaveChangesAsync();
                        await transaction.CommitAsync();

                        // Queue notifications for ECO approval and release
                        await ecoNotificationService.NotifyEcoApprovedAsync(ecoEntityId);
                        await ecoNotificationService.NotifyEcoReleasedAsync(ecoEntityId);

                        return new NoContentResult();
                    }
                    catch (Exception ex)
                    {
                        await transaction.RollbackAsync();
                        throw new ApplicationException("Error during ECO approval process", ex);
                    }
                }

            return new NoContentResult();
        }

        public async Task<Eco> UpdateStatus(Guid ecoEntityId, string newStatus)
        {
            var ecoRecord = await spaceLinxContext.Ecos
                .FirstOrDefaultAsync(x => x.Id == ecoEntityId);

            if (ecoRecord == null)
            {
                throw new ApplicationException($"ECO with ID {ecoEntityId} not found.");
            }

            ValidateStatus(ecoRecord.Status, newStatus);

            ecoRecord.Status = newStatus;
            ecoRecord.UpdatedBy = UserEmail;
            ecoRecord.UpdatedAt = DateTime.UtcNow;

            await spaceLinxContext.SaveChangesAsync();
            return ecoRecord;
        }

        private void ValidateStatus(string currentStatus, string newStatus)
        {
            var validStatus = new Dictionary<string, List<string>>
            {
                { EcoStatus.Draft, new List<string> { EcoStatus.Submitted, EcoStatus.Discarded } },
                { EcoStatus.Submitted, new List<string> { EcoStatus.Approved, EcoStatus.Rejected, EcoStatus.Draft } },
                { EcoStatus.Approved, new List<string> { EcoStatus.Released } }
            };

            if (!validStatus.ContainsKey(currentStatus) || !validStatus[currentStatus].Contains(newStatus))
            {
                throw new ApplicationException($"Invalid status from {currentStatus} to {newStatus}.");
            }
        }
    }
}