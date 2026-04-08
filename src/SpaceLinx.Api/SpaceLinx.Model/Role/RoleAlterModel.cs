namespace SpaceLinx.Model;

public class RoleAlterModel
{
    public string RoleName { get; set; } = null!;
    public string? RoleDescription { get; set; }
    public bool SystemDefined { get; set; }
}
