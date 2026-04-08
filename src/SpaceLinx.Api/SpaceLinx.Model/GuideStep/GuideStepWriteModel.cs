namespace SpaceLinx.Model
{
    public partial class GuideStepWriteModel : BaseWriteModel
    {
        public string Title { get; set; } = null!;
        public Guid GuideId { get; set; }
        public Guid? ImageId { get; set; }
        public Guid? VideoId { get; set; }
        public int? Sequence { get; set; }
        public string? Comment { get; set; }
    }
}
