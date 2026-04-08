using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using SpaceLinx.Api.Interfaces;
using SpaceLinx.Api.Security;
using SpaceLinx.Model;
using System.Text.RegularExpressions;

namespace SpaceLinx.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
[SpaceLinxAuthroize]
public class EcoController(SpaceLinxContext spaceLinxContext, IMapper mapper, IHttpContextAccessor httpContextAccessor, IPartService partService,
    IEcoPartService ecoPartService, IEcoService ecoService, IUserService userService, IApprovalService approvalService,
    IEcoNotificationService ecoNotificationService) :
    GenericRestController<Eco, EcoWriteModel, EcoUpdateModel, EcoReadModel, EcoRefModel>(spaceLinxContext, mapper, httpContextAccessor)
{
    [NonAction]
    public override Task<IActionResult> Post(EcoWriteModel newRecord)
    {
        return base.Post(newRecord);
    }

    [NonAction]
    public override Task<IActionResult> Update(Guid id, EcoUpdateModel updatedRecord)
    {
        return base.Update(id, updatedRecord);
    }

    [HttpGet("eco-approval-history/{ecoId}")]
    public async Task<IActionResult> GetEcoApprovalHistory(Guid ecoId)
    {
        var result = await spaceLinxContext.Approvals
            .AsNoTracking()
            .Include(a => a.Approver)
            .Where(a => a.EntityType == SpaceLinxEntities.Eco && a.EntityId == ecoId && a.DeletedBy == null)
            .OrderBy(a => a.StageNumber)
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("eco-with-users")]
    public async Task<IActionResult> GetEco()
    {
        var result = await spaceLinxContext.EcoWithUsersVws
            .AsNoTracking()
            .ToListAsync();

        return Ok(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetDetailsById(Guid id)
    {
        var record = await spaceLinxContext.Ecos
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        var requestor = record.Requestor != null ? await userService.GetUser(record.Requestor) : null;
        var approvedBy = record.ApprovedBy != null ? await userService.GetUser(record.ApprovedBy) : null;

        if (record == null)
        {
            return NotFound();
        }

        var ecoParts = await spaceLinxContext.EcoParts
            .AsNoTracking()
            .Where(x => x.EcoId == record.Id && x.DeletedBy == null)
            .Select(ep => new
            {
                ep.Id,
                ep.EcoId,
                ep.PartId,
                ep.PreviousStatus,
                ep.Status,
                ep.Description,
                ep.OldVersion,
                ep.NewVersion,
                ep.EffectiveDate,
                PartDetails = spaceLinxContext.Parts
                    .AsNoTracking()
                    .Where(p => p.Id == ep.PartId && p.DeletedBy == null)
                    .Select(p => new
                    {
                        p.EcoId,
                        p.Id,
                        p.Name,
                        p.PartNumberSuffix,
                        p.PartNumber,
                        p.MakeBuy,
                        p.ManufacturerName,
                        p.ManufacturingPartNumber,
                        p.Version,
                        p.Status
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();

        var approvers = await spaceLinxContext.Approvals
            .AsNoTracking()
            .Include(a => a.Approver)
            .Where(a => a.EntityType == SpaceLinxEntities.Eco && a.EntityId == record.Id && a.DeletedBy == null)
            .OrderBy(a => a.StageNumber)
            .ToListAsync();

        return Ok(new
        {
            EcoDetails = record,
            EcoParts = ecoParts,
            Approvers = approvers,
            Requestor = requestor,
            ApprovedBy = approvedBy
        });
    }

    [HttpGet("Status")]
    public async Task<IActionResult> GetByStatus(string status)
    {
        var records = await spaceLinxContext.Ecos
            .AsNoTracking()
            .Where(x => x.Status == status && x.DeletedBy == null).ToListAsync();

        return Ok(records);
    }

    [HttpPost("create-eco-with-parts")]
    public async Task<IActionResult> CreateEcoWithParts([FromBody] EcoPostModel newRecord)
    {
        if (newRecord.ChangeType != "Initial Release" && string.IsNullOrWhiteSpace(newRecord.ImpactAnalysis))
        {
            return BadRequest("ImpactAnalysis is required when ChangeType is not 'Initial Release'.");
        }

        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var ecoWriteModel = new EcoWriteModel
            {
                Name = newRecord.Name,
                ReasonForChange = newRecord.ReasonForChange,
                Description = newRecord.Description,
                ChangeType = newRecord.ChangeType,
                ImpactAnalysis = newRecord.ImpactAnalysis,
                Priority = newRecord.Priority,
                Requestor = UserEmail,
                Approver = newRecord.Approver,
            };

            var ecoEntity = mapper.Map<Eco>(ecoWriteModel);

            ecoEntity.CreatedBy = UserEmail;
            ecoEntity.IsActive = true;
            spaceLinxContext.Ecos.Add(ecoEntity);
            await spaceLinxContext.SaveChangesAsync();

            foreach (var ecoPart in newRecord.EcoParts)
            {
                await ecoPartService.CreateEcoPart(ecoEntity.Id.Value, ecoPart);
            }

            await approvalService.AddEcoApproversAsync(ecoEntity.Id.Value, newRecord.Approvals, UserEmail);

            var ecoLog = new EcoLog
            {
                EcoId = ecoEntity.Id.Value,
                Action = EcoStatus.Draft,
                ActionBy = UserEmail,
                ActionAt = DateTime.UtcNow,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            await spaceLinxContext.EcoLogs.AddAsync(ecoLog);
            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            var ecoReadModel = mapper.Map<EcoReadModel>(ecoEntity);

            return CreatedAtAction(nameof(Get), new { id = ecoEntity.Id }, ecoReadModel);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPut("approve/{ecoEntityId}")]
    public async Task<IActionResult> UpdateStatusToApprove(Guid ecoEntityId, string? comment)
    {
        var result = await ecoService.UpdateApproverStatusToApprove(ecoEntityId, comment, UserEmail);
        return result;
    }

    [HttpPut("eco-update/{id}")]
    public async Task<IActionResult> UpdateEco(Guid id, EcoAlterModel updatedRecord)
    {
        if (updatedRecord.ChangeType != "Initial Release" && string.IsNullOrWhiteSpace(updatedRecord.ImpactAnalysis))
        {
            return BadRequest("ImpactAnalysis is required when ChangeType is not 'Initial Release'.");
        }

        var record = await spaceLinxContext.Ecos.FirstOrDefaultAsync(x => x.Id == id && x.DeletedBy == null);

        if (record is null)
        {
            return NotFound();
        }
        else if (record.Status != "Draft")
        {
            throw new ApplicationException("Eco must be in Draft status to update");
        }

        updatedRecord.Id = record.Id;
        record.Name = updatedRecord.Name;
        record.ReasonForChange = updatedRecord.ReasonForChange;
        record.Description = updatedRecord.Description;
        record.ChangeType = updatedRecord.ChangeType;
        record.ImpactAnalysis = updatedRecord.ImpactAnalysis;
        record.Priority = updatedRecord.Priority;
        record.PlannedImplementationDate = updatedRecord.PlannedImplementationDate;
        record.UpdatedBy = UserEmail;
        record.UpdatedAt = DateTime.UtcNow;

        await spaceLinxContext.SaveChangesAsync();

        await approvalService.UpdateEcoApproversAsync(record.Id.Value, updatedRecord.Approvals);

        var ecoLog = new EcoLog
        {
            EcoId = record.Id.Value,
            Action = EcoStatus.Draft,
            ActionBy = UserEmail,
            ActionAt = DateTime.UtcNow,
            IsActive = true,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow
        };

        await spaceLinxContext.EcoLogs.AddAsync(ecoLog);
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{ecoEntityId}/submit")]
    public async Task<IActionResult> Submit(Guid ecoEntityId)
    {
        try
        {
            await spaceLinxContext.Database
                .ExecuteSqlInterpolatedAsync($"CALL mes.is_eco_valid_for_submit({ecoEntityId})");

            var updatedEco = await ecoService.UpdateStatus(ecoEntityId, EcoStatus.Submitted);

            var ecoLog = new EcoLog
            {
                EcoId = updatedEco.Id.Value,
                Action = EcoStatus.Submitted,
                ActionBy = UserEmail,
                ActionAt = DateTime.UtcNow,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            await spaceLinxContext.EcoLogs.AddAsync(ecoLog);
            await spaceLinxContext.SaveChangesAsync();

            // Queue notification for ECO submission
            await ecoNotificationService.NotifyEcoSubmittedAsync(ecoEntityId);

            return NoContent();
        }
        catch (PostgresException ex)
        {
            var message = ex.MessageText;
            var segments = message.Split('|', StringSplitOptions.RemoveEmptyEntries)
                                  .Select(s => s.Trim())
                                  .ToList();

            // 1st segment is the ECO-level message
            var ecoMessage = segments.ElementAtOrDefault(0) ?? "ECO has no Documents.";

            // Find relevant segments
            var partsSegment = segments
                .FirstOrDefault(s => s.StartsWith("Effected parts missing docs", StringComparison.OrdinalIgnoreCase));
            var childDocsSegment = segments
                .FirstOrDefault(s => s.StartsWith("Child parts missing docs", StringComparison.OrdinalIgnoreCase));
            var unreleasedSegment = segments
                .FirstOrDefault(s => s.StartsWith("Unreleased BOM parts not in ECO", StringComparison.OrdinalIgnoreCase));

            // Extract GUIDs
            var partsWithNoDocIds = partsSegment != null
                ? Regex.Matches(partsSegment, @"PartID:\s*([0-9A-Fa-f\-]{36})")
                       .Select(m => Guid.Parse(m.Groups[1].Value))
                       .Distinct()
                       .ToList()
                : new List<Guid>();

            var childPartsWithNoDocIds = childDocsSegment != null
                ? Regex.Matches(childDocsSegment, @"ChildPartID:\s*([0-9A-Fa-f\-]{36})")
                       .Select(m => Guid.Parse(m.Groups[1].Value))
                       .Distinct()
                       .ToList()
                : new List<Guid>();

            var unreleasedBomIds = unreleasedSegment != null
                ? Regex.Matches(unreleasedSegment, @"PartID:\s*([0-9A-Fa-f\-]{36})")
                       .Select(m => Guid.Parse(m.Groups[1].Value))
                       .Distinct()
                       .ToList()
                : new List<Guid>();

            // Fetch parts
            var partsWithNoDocuments = await spaceLinxContext.Parts
                .Where(p => partsWithNoDocIds.Contains(p.Id.Value))
                .ToListAsync();

            var bomChildPartsWithNoDocuments = await spaceLinxContext.Parts
                .Where(p => childPartsWithNoDocIds.Contains(p.Id.Value))
                .ToListAsync();

            var unreleasedBomParts = await spaceLinxContext.Parts
                .Where(p => unreleasedBomIds.Contains(p.Id.Value))
                .ToListAsync();

            return BadRequest(new
            {
                ecoMessage = "Eco validation failed",
                Message = ecoMessage,
                partsWithNoDocuments = mapper.Map<List<PartRefModel>>(partsWithNoDocuments),
                bomPartsWithNoDocuments = mapper.Map<List<PartRefModel>>(bomChildPartsWithNoDocuments),
                nonReleasedMissingParts = mapper.Map<List<PartRefModel>>(unreleasedBomParts)
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "An unexpected error occurred.",
                details = ex.Message
            });
        }
    }

    [HttpPut("{ecoEntityId}/discard")]
    public async Task<IActionResult> Discard(Guid ecoEntityId)
    {
        var record = await spaceLinxContext.Ecos
                  .FirstOrDefaultAsync(x => x.Id == ecoEntityId && x.DeletedBy == null);

        if (record == null)
        {
            return NotFound();
        }

        if (record.Status != "Draft")
        {
            throw new ApplicationException("Eco must be in Draft status to Discard");
        }

        await spaceLinxContext.Database.ExecuteSqlRawAsync("CALL mes.discard_eco(@EcoId, @UserEmail)",
            new NpgsqlParameter("@EcoId", ecoEntityId), new NpgsqlParameter("@UserEmail", UserEmail));

        var ecoLog = new EcoLog
        {
            EcoId = record.Id.Value,
            Action = EcoStatus.Discarded,
            ActionBy = UserEmail,
            ActionAt = DateTime.UtcNow,
            IsActive = true,
            CreatedBy = UserEmail,
            CreatedAt = DateTime.UtcNow
        };

        await spaceLinxContext.EcoLogs.AddAsync(ecoLog);
        await spaceLinxContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{ecoEntityId}/reject")]
    public async Task<IActionResult> Reject(Guid ecoEntityId, string notes)
    {
        using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var updatedEco = await ecoService.UpdateStatus(ecoEntityId, EcoStatus.Draft);

            var approvals = await spaceLinxContext.Approvals
                .Where(a => a.EntityType == SpaceLinxEntities.Eco && a.EntityId == ecoEntityId && a.DeletedBy == null)
                .ToListAsync();

            var user = await userService.GetUser(UserEmail);

            foreach (var approver in approvals)
            {
                if(approver.ApproverId == user.Id)
                {
                    approver.Status = ApprovalStatus.Pending;
                }

                approver.ActedAt = DateTime.UtcNow;
                approver.Comment = notes;
                approver.UpdatedBy = UserEmail;
                approver.UpdatedAt = DateTime.UtcNow;
            }

            spaceLinxContext.Approvals.UpdateRange(approvals);

            var ecoLog = new EcoLog
            {
                EcoId = updatedEco.Id.Value,
                Action = EcoStatus.Rejected,
                ActionBy = UserEmail,
                ActionAt = DateTime.UtcNow,
                Notes = notes,
                IsActive = true,
                CreatedBy = UserEmail,
                CreatedAt = DateTime.UtcNow
            };

            await spaceLinxContext.EcoLogs.AddAsync(ecoLog);

            await spaceLinxContext.SaveChangesAsync();
            await transaction.CommitAsync();

            // Queue notification for ECO rejection
            await ecoNotificationService.NotifyEcoRejectedAsync(ecoEntityId, UserEmail, notes);

            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { message = "Error while rejecting ECO", details = ex.Message });
        }
    }

    [HttpPut("{ecoEntityId}/update-approvers")]
    public async Task<IActionResult> UpdateEcoApproversAsync(Guid ecoEntityId, List<ApprovalWriteModel> updatedApprovals)
    {
        await using var transaction = await spaceLinxContext.Database.BeginTransactionAsync();
        try
        {
            var ecoRecord = await spaceLinxContext.Ecos
                .FirstOrDefaultAsync(e => e.Id == ecoEntityId && e.DeletedBy == null);

            if (ecoRecord is null)
                return NotFound();

            if (ecoRecord.Status is not EcoStatus.Draft)
                throw new ApplicationException("ECO must be in Draft status to update approvers.");

            await approvalService.UpdateEcoApproversAsync(ecoEntityId, updatedApprovals);

            await transaction.CommitAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new
            {
                Message = "An error occurred while updating ECO approvers.",
                Details = ex.Message
            });
        }
    }
}