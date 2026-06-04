namespace SpaceLinx.Model;

// Email send log — its own record of truth; excluded from the change-history audit trail.
[AuditExclude]
public partial class EmailLog : BaseModel
{
    // UAT: created_at / is_active are NULLABLE on this table. BaseModel declares them non-nullable;
    // shadow as nullable so the EF column matches UAT exactly. DB defaults (CURRENT_TIMESTAMP / true)
    // populate them on insert; the generic controller deactivate/remove writes IsActive via the EF entry.
    public new DateTime? CreatedAt { get; set; }
    public new bool? IsActive { get; set; }

    public string TemplateCode { get; set; } = null!;
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string RecipientEmail { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? SentAt { get; set; }
    public string? ErrorMessage { get; set; }
    public int? RetryCount { get; set; }
}
