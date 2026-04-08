namespace SpaceLinx.Model
{
    public partial class GuideRefModel : BaseRefModel
    {
        public string Name { get; set; } = null!;
        public string Number { get; set; } = null!;
        public string? Category { get; set; }
    }
}
