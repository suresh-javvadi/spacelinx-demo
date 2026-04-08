namespace SpaceLinx.Model
{
    public partial class GuideStepTaskRefModel : BaseRefModel
    {
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int? Sequence { get; set; }
    }
}
