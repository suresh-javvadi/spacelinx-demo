namespace SpaceLinx.Model;

public partial class UserRole : BaseModel
{
    public Guid UserId { get; set; }
    public Guid RoleId { get; set; }
    public bool IsDefault { get; set; }
    public virtual Role Role { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}