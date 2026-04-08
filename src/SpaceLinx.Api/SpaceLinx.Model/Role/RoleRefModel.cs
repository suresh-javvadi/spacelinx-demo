namespace SpaceLinx.Model
{
    public partial class RoleRefModel : BaseRefModel
    {
        public string RoleName { get; set; } = null!;
        public Guid AppId { get; set; }
        public bool SystemDefined { get; set; }
    }
}
