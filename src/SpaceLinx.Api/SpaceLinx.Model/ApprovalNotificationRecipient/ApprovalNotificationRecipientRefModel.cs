namespace SpaceLinx.Model;

public partial class ApprovalNotificationRecipientRefModel : BaseRefModel
{
    public Guid RecipientUserId { get; set; }
    public string? RecipientType { get; set; }
}
