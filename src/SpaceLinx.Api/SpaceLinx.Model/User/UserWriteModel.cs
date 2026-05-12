namespace SpaceLinx.Model
{
    public partial class UserWriteModel : BaseWriteModel
    {
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public Guid? DepartmentId { get; set; }
        public virtual ICollection<UserCreateRoleRefModel> Roles { get; set; } = new List<UserCreateRoleRefModel>();
    }
}