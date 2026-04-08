namespace SpaceLinx.Model
{
    public partial class GuideStepRefModel : BaseRefModel
    {
        public string Title { get; set; } = null!;
        public int Sequence { get; set; }
        public Guid GuideId { get; set; }
    }
}
