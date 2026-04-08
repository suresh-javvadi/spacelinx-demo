namespace SpaceLinx.Model;

public class RoleCreateModel
{
    public string RoleName { get; set; } = null!;
    public string? RoleDescription { get; set; }
    public bool SystemDefined { get; set; }
}
