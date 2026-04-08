namespace SpaceLinx.Model
{
    public class UserDetailWithUserRoleReadModel : BaseReadModel
    {    
        public int UserNumber { get; set; }
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public virtual ICollection<RoleRefWithDefaultModel> Roles { get; set; } = new List<RoleRefWithDefaultModel>();
        
    }
}
