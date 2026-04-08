namespace SpaceLinx.Model;

public class RoleRefWithDefaultModel
{
    public string RoleName { get; set; } = null!;
    public Guid AppId { get; set; }
    public bool SystemDefined { get; set; }
    public bool IsDefault { get; set; }
}
