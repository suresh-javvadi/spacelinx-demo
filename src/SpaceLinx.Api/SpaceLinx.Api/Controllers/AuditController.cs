using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpaceLinx.Api.Security;
using SpaceLinx.Api.Security.Authorization;
using SpaceLinx.Model;
using Task = System.Threading.Tasks.Task;

namespace SpaceLinx.Api.Controllers;

/// <summary>
/// Read-only access to the platform audit trail (<c>audit.change_log</c>) for production-issue
/// triage and forensics. Gated by <c>AUDIT.VIEW</c>. Audit records for regulated/controlled
/// entities (see <see cref="RegulatedEntityTypes"/>) are additionally gated by
/// <c>AUDIT.VIEW.REGULATED</c>: callers without it never receive those rows. Every read is logged
/// (segregation of duties: the audit reader is recorded). Audit records cannot be written or
/// deleted through any API.
/// </summary>
[RequirePermission(Permissions.Audit.View._Self)]
public class AuditController(
    SpaceLinxContext spaceLinxContext,
    IHttpContextAccessor httpContextAccessor,
    IPermissionResolver permissionResolver,
    ILogger<AuditController> logger)
    : BaseController(spaceLinxContext, httpContextAccessor)
{
    private const int MaxTake = 500;
    private const int DefaultTake = 100;

    /// <summary>
    /// Entity types whose audit records are regulated/export-controlled and require
    /// <c>AUDIT.VIEW.REGULATED</c>. Authoritative list — extend as regulated entities are added.
    /// The whole entity is treated as regulated (fail-closed superset); finer category-level
    /// gating within an entity is a future refinement.
    /// </summary>
    private static readonly string[] RegulatedEntityTypes =
    [
        "ComplianceItem",        // ITU filings, insurance, shipment cert, ETL, export control
        "RegulatoryFiling",
        "InsuranceDocument",
        "ExportControlRecord",
        "ShipmentCertification"
    ];

    /// <summary>History of a single record, newest first ("who changed this row").</summary>
    [HttpGet("record")]
    public async Task<ActionResult<IEnumerable<ChangeLogReadModel>>> GetRecordHistory(
        [FromQuery] string entityType, [FromQuery] Guid entityId, [FromQuery] int take = DefaultTake,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(entityType) || entityId == Guid.Empty)
        {
            return BadRequest("entityType and entityId are required.");
        }

        var includeRegulated = await CanViewRegulatedAsync(cancellationToken);
        if (!includeRegulated && IsRegulated(entityType))
        {
            LogRead("record", $"{entityType}/{entityId}", denied: true);
            return Forbid();
        }

        var query = spaceLinxContext.ChangeLogs.AsNoTracking()
            .Where(c => c.EntityType == entityType && c.RowPk == entityId)
            .OrderByDescending(c => c.Id);

        LogRead("record", $"{entityType}/{entityId}");
        return Ok(await Project(query, take, includeRegulated));
    }

    /// <summary>Everything a user did in an optional time window ("what did user X change").</summary>
    [HttpGet("activity")]
    public async Task<ActionResult<IEnumerable<ChangeLogReadModel>>> GetActorActivity(
        [FromQuery] string actor, [FromQuery] DateTime? from, [FromQuery] DateTime? to,
        [FromQuery] int take = DefaultTake, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(actor))
        {
            return BadRequest("actor is required.");
        }

        var actorLower = actor.ToLowerInvariant();
        var query = spaceLinxContext.ChangeLogs.AsNoTracking()
            .Where(c => c.ActorEmail == actorLower
                        && (from == null || c.OccurredAt >= from)
                        && (to == null || c.OccurredAt <= to))
            .OrderByDescending(c => c.Id);

        LogRead("activity", actorLower);
        return Ok(await Project(query, take, await CanViewRegulatedAsync(cancellationToken)));
    }

    /// <summary>All changes made under one request correlation id (ties a change to its request/logs).</summary>
    [HttpGet("correlation/{correlationId}")]
    public async Task<ActionResult<IEnumerable<ChangeLogReadModel>>> GetByCorrelation(
        string correlationId, [FromQuery] int take = DefaultTake, CancellationToken cancellationToken = default)
    {
        var query = spaceLinxContext.ChangeLogs.AsNoTracking()
            .Where(c => c.CorrelationId == correlationId)
            .OrderByDescending(c => c.Id);

        LogRead("correlation", correlationId);
        return Ok(await Project(query, take, await CanViewRegulatedAsync(cancellationToken)));
    }

    /// <summary>General search across the trail with optional filters and paging.</summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ChangeLogReadModel>>> Search(
        [FromQuery] string? entityType, [FromQuery] string? actor, [FromQuery] string? operation,
        [FromQuery] DateTime? from, [FromQuery] DateTime? to,
        [FromQuery] int skip = 0, [FromQuery] int take = DefaultTake, CancellationToken cancellationToken = default)
    {
        var includeRegulated = await CanViewRegulatedAsync(cancellationToken);
        if (!includeRegulated && entityType is not null && IsRegulated(entityType))
        {
            LogRead("search", $"entityType={entityType}", denied: true);
            return Forbid();
        }

        var actorLower = actor?.ToLowerInvariant();
        var query = spaceLinxContext.ChangeLogs.AsNoTracking()
            .Where(c => (entityType == null || c.EntityType == entityType)
                        && (actorLower == null || c.ActorEmail == actorLower)
                        && (operation == null || c.Operation == operation)
                        && (from == null || c.OccurredAt >= from)
                        && (to == null || c.OccurredAt <= to))
            .OrderByDescending(c => c.Id)
            .Skip(Math.Max(0, skip));

        LogRead("search", $"entityType={entityType};actor={actorLower};operation={operation}");
        return Ok(await Project(query, take, includeRegulated));
    }

    private async Task<bool> CanViewRegulatedAsync(CancellationToken cancellationToken)
    {
        var permissions = await permissionResolver.GetCurrentAsync(cancellationToken);
        return permissions.Has(Permissions.Audit.View.Regulated);
    }

    private static bool IsRegulated(string entityType)
        => RegulatedEntityTypes.Contains(entityType, StringComparer.OrdinalIgnoreCase);

    private static async Task<List<ChangeLogReadModel>> Project(
        IQueryable<ChangeLog> query, int take, bool includeRegulated)
    {
        // Callers without AUDIT.VIEW.REGULATED never receive regulated rows.
        if (!includeRegulated)
        {
            query = query.Where(c => !RegulatedEntityTypes.Contains(c.EntityType));
        }

        return await query
            .Take(Math.Clamp(take, 1, MaxTake))
            .Select(c => new ChangeLogReadModel
            {
                Id = c.Id,
                OccurredAt = c.OccurredAt,
                SchemaName = c.SchemaName,
                TableName = c.TableName,
                EntityType = c.EntityType,
                RowPk = c.RowPk,
                Operation = c.Operation,
                OldValues = c.OldValues,
                NewValues = c.NewValues,
                ChangedColumns = c.ChangedColumns,
                ActorEmail = c.ActorEmail,
                ActorRoleId = c.ActorRoleId,
                AppName = c.AppName,
                CorrelationId = c.CorrelationId,
                RequestPath = c.RequestPath,
                RequestMethod = c.RequestMethod,
                SourceIp = c.SourceIp,
                Success = c.Success
            })
            .ToListAsync();
    }

    private void LogRead(string kind, string filter, bool denied = false)
        => logger.LogInformation(
            "Audit trail read [{Kind}]{Denied} by {Actor}: {Filter}",
            kind, denied ? " DENIED(regulated)" : string.Empty, UserEmail, filter);
}
