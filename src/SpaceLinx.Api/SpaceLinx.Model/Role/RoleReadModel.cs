namespace SpaceLinx.Model
{
    public partial class RoleReadModel : BaseReadModel
    {
        public int RoleNumber { get; set; }
        public string RoleName { get; set; } = null!;
        public string? RoleDescription { get; set; }
        public Guid AppId { get; set; }
        public bool SystemDefined { get; set; }
        public virtual AppRefModel App { get; set; } = null!;
    }
}