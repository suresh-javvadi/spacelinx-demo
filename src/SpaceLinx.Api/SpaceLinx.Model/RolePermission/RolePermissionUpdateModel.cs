namespace SpaceLinx.Model
{
    public partial class RolePermissionUpdateModel : BaseUpdateModel
    {
        public Guid RoleId { get; set; }
        public string Permission { get; set; } = null!;
        public bool Enable { get; set; }
    }
}
