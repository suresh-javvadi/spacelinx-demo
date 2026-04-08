namespace SpaceLinx.Model
{
    public partial class RolePermissionWriteModel : BaseWriteModel
    {
        public Guid RoleId { get; set; }
        public string Permission { get; set; } = null!;
        public bool Enable { get; set; }
    }
}
