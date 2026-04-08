namespace SpaceLinx.Model
{
    public partial class GuideStepReadModel : BaseReadModel
    {
        public string Title { get; set; } = null!;
        public Guid GuideId { get; set; }
        public Guid? ImageId { get; set; }
        public Guid? VideoId { get; set; }
        public int Sequence { get; set; }
        public string? Comment { get; set; }
        public virtual GuideRefModel Guide { get; set; } = null!;
        public virtual ImageRefModel? Image { get; set; }
        public virtual VideoRefModel? Video { get; set; }
    }
}