namespace SpaceLinx.Model
{
    public partial class UserRoleUpdateModel : BaseUpdateModel
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
        public bool IsDefault { get; set; }
    }
}