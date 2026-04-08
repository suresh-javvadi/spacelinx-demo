namespace SpaceLinx.Model
{
    public partial class RoleFilter : BaseModel
    {
        public Guid RoleId { get; set; }
        public string Entity { get; set; } = null!;
        public string Key { get; set; } = null!;
        public string Operator { get; set; } = null!;
        public string Value { get; set; } = null!;
        public virtual Role Role { get; set; } = null!;
    }
}
