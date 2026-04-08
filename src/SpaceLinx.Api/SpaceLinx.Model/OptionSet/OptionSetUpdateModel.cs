namespace SpaceLinx.Model
{
    public partial class OptionSetUpdateModel : BaseUpdateModel
    {
        public string? Description { get; set; }
        public string Values { get; set; } = null!;
        public string DisplayName { get; set; } = null!;
        public string? Columns { get; set; }
    }
}