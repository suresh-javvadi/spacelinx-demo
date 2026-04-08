namespace SpaceLinx.Model
{
    public partial class RoleWriteModel : BaseWriteModel
    {
        public string RoleName { get; set; } = null!;
        public string? RoleDescription { get; set; }
        public Guid AppId { get; set; }
        public bool SystemDefined { get; set; }
    }
}
