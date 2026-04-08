namespace SpaceLinx.Model;

public partial class Role : BaseModel
{
    public int RoleNumber { get; set; }
    public string RoleName { get; set; } = null!;
    public string? RoleDescription { get; set; }
    public Guid AppId { get; set; }
    public bool SystemDefined { get; set; }
    public virtual App App { get; set; } = null!;
    public virtual ICollection<RoleFilter> RoleFilters { get; set; } = new List<RoleFilter>();
    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
