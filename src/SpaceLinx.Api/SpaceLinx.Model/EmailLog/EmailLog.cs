namespace SpaceLinx.Model;

// Email send log — its own record of truth; excluded from the change-history audit trail.
[AuditExclude]
public partial class EmailLog : BaseModel
{
    public string TemplateCode { get; set; } = null!;
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string RecipientEmail { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? SentAt { get; set; }
    public string? ErrorMessage { get; set; }
    public int RetryCount { get; set; }
}
