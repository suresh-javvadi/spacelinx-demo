namespace SpaceLinx.Model;

public partial class ApprovalNotificationRecipientReadModel : BaseReadModel
{
    public string EntityType { get; set; } = null!;
    public Guid EntityId { get; set; }
    public Guid RecipientUserId { get; set; }
    public string? RecipientType { get; set; }
    public virtual UserRefModel RecipientUser { get; set; } = null!;
}
