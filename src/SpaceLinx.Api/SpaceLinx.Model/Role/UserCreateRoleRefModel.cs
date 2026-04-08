namespace SpaceLinx.Model
{
    public partial class UserCreateRoleRefModel
    {
        public Guid Id { get; set; }
        public string RoleName { get; set; } = null!;
        public bool SystemDefined { get; set; }
    }
}