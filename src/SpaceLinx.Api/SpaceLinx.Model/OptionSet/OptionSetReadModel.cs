namespace SpaceLinx.Model
{
    public partial class OptionSetReadModel : BaseReadModel
    {
        public string Name { get; set; } = null!;
        public string ApplicationName { get; set; } = null!;
        public string? Description { get; set; }
        public string Values { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Columns { get; set; }
    }
}