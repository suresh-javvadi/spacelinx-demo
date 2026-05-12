namespace SpaceLinx.Model
{
    public partial class UserUpdateModel : BaseUpdateModel
    {
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public Guid? DepartmentId { get; set; }
        public virtual ICollection<RoleRefModel> Roles { get; set; } = new List<RoleRefModel>();
    }
}
