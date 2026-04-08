namespace SpaceLinx.Model
{
    public partial class RolePermission : BaseModel
    {
        public Guid RoleId { get; set; }
        public string Permission { get; set; } = null!;
        public bool Enable { get; set; }
        public virtual Role Role { get; set; } = null!;
    }
}
    