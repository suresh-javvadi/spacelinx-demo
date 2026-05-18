namespace SpaceLinx.Model
{
    public partial class UserDetailReadModel : BaseReadModel
    {
        public int UserNumber { get; set; }
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public Guid? DepartmentId { get; set; }
        public DepartmentRefModel? DepartmentRef { get; set; }
        public virtual ICollection<RoleRefModel> Roles { get; set; } = new List<RoleRefModel>();
    }
}
