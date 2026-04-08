namespace SpaceLinx.Model
{
    public partial class RolePermissionReadModel : BaseReadModel
    {
        public Guid RoleId { get; set; }
        public string Permission { get; set; } = null!;
        public bool Enable { get; set; }
        public virtual RoleRefModel Role { get; set; } = null!;
    }
}
