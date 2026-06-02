namespace SpaceLinx.Model;

/// <summary>
/// Append-only audit record capturing a single entity change (insert / update / delete)
/// made through the application. Written by <c>SpaceLinxAuditInterceptor</c>; never updated
/// or deleted by the application. Maps to <c>audit.change_log</c> (range-partitioned by month).
/// </summary>
public class ChangeLog
{
    /// <summary>Monotonic surrogate key (bigint identity). Physical PK is (id, occurred_at).</summary>
    public long Id { get; set; }

    /// <summary>When the change occurred (UTC).</summary>
    public DateTime OccurredAt { get; set; }

    /// <summary>PostgreSQL schema of the changed table (e.g. <c>mes</c>, <c>sc</c>, <c>pm</c>).</summary>
    public string SchemaName { get; set; } = null!;

    /// <summary>Physical table name of the changed row.</summary>
    public string TableName { get; set; } = null!;

    /// <summary>CLR/entity type name of the changed row.</summary>
    public string EntityType { get; set; } = null!;

    /// <summary>Primary key of the changed row.</summary>
    public Guid RowPk { get; set; }

    /// <summary>INSERT | UPDATE | SOFT_DELETE | HARD_DELETE.</summary>
    public string Operation { get; set; } = null!;

    /// <summary>Before-image (changed columns only for UPDATE; full row for DELETE). JSON, redacted.</summary>
    public string? OldValues { get; set; }

    /// <summary>After-image (changed columns only for UPDATE; full row for INSERT). JSON, redacted.</summary>
    public string? NewValues { get; set; }

    /// <summary>Names of the columns that changed (UPDATE only).</summary>
    public string[]? ChangedColumns { get; set; }

    /// <summary>Actor email from the JWT, or <c>system@spacelinx.internal</c> for background work.</summary>
    public string ActorEmail { get; set; } = null!;

    /// <summary>Active role id at the time of the action (from the <c>roleId</c> header), if any.</summary>
    public Guid? ActorRoleId { get; set; }

    /// <summary>Permission that authorized the action (reserved; populated once authz is enforced).</summary>
    public string? AuthorizedBy { get; set; }

    /// <summary>True when a super-admin override was used (reserved for the authz integration).</summary>
    public bool Bypass { get; set; }

    /// <summary>Originating application (from the <c>SPACELINX-APP-NAME</c> header).</summary>
    public string? AppName { get; set; }

    /// <summary>Tenant identifier, if present.</summary>
    public string? TenantId { get; set; }

    /// <summary>Correlation / trace id tying this change to the request and error logs.</summary>
    public string? CorrelationId { get; set; }

    /// <summary>Request path that produced the change.</summary>
    public string? RequestPath { get; set; }

    /// <summary>Request HTTP method.</summary>
    public string? RequestMethod { get; set; }

    /// <summary>Source IP address of the caller.</summary>
    public string? SourceIp { get; set; }

    /// <summary>Caller user agent.</summary>
    public string? UserAgent { get; set; }

    /// <summary>False when the change was captured from a failed SaveChanges.</summary>
    public bool Success { get; set; } = true;

    /// <summary>Origin of the record: 'A' = application interceptor, 'T' = database trigger.</summary>
    public string Source { get; set; } = "A";
}
