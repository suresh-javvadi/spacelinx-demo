namespace SpaceLinx.Model
{
    public partial class RolePermissionRefModel : BaseRefModel
    {
        public Guid RoleId { get; set; }
        public string Permission { get; set; } = null!;
        public bool Enable { get; set; }
    }
}
