namespace SpaceLinx.Model
{
    public partial class RoleUpdateModel : BaseUpdateModel
    {
        public string RoleName { get; set; } = null!;
        public string? RoleDescription { get; set; }
        public Guid AppId { get; set; }
        public bool SystemDefined { get; set; }
    }
}
