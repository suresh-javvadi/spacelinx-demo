namespace SpaceLinx.Model
{
    public partial class UserRoleReadModel : BaseReadModel
    {
        public Guid UserId { get; set; }
        public Guid RoleId { get; set; }
        public bool IsDefault { get; set; }
        public virtual RoleRefModel Role { get; set; } = null!;
        public virtual UserRefModel User { get; set; } = null!;
    }
}