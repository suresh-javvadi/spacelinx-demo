namespace SpaceLinx.Model;

public partial class ApprovalNotificationRecipient : BaseModel
{
    public string EntityType { get; set; } = null!;
    public Guid EntityId { get; set; }
    public Guid RecipientUserId { get; set; }
    public string? RecipientType { get; set; }
    public virtual User RecipientUser { get; set; } = null!;
}
