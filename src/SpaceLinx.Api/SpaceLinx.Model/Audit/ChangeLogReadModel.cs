namespace SpaceLinx.Model;

/// <summary>Read projection of an <see cref="ChangeLog"/> audit record for the audit API.</summary>
public class ChangeLogReadModel
{
    public long Id { get; set; }
    public DateTime OccurredAt { get; set; }
    public string SchemaName { get; set; } = null!;
    public string TableName { get; set; } = null!;
    public string EntityType { get; set; } = null!;
    public Guid RowPk { get; set; }
    public string Operation { get; set; } = null!;
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string[]? ChangedColumns { get; set; }
    public string ActorEmail { get; set; } = null!;
    public Guid? ActorRoleId { get; set; }
    public string? AppName { get; set; }
    public string? CorrelationId { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public string? SourceIp { get; set; }
    public bool Success { get; set; }
}
