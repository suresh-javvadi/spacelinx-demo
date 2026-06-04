namespace SpaceLinx.Model;

public partial class FcmToken
{
    public Guid? Id { get; set; } // UAT: common.fcm_token.id is NULLABLE (default gen_random_uuid())
    public string Email { get; set; } = null!;
    public string DeviceId { get; set; } = null!;
    public string? DeviceToken { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = null!;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}
