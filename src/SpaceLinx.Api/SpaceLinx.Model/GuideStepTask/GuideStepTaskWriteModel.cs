namespace SpaceLinx.Model
{
    public partial class GuideStepTaskWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string? Taskdetails { get; set; }
        public string? Description { get; set; }
        public int Ismandatory { get; set; }
        public Guid GuideStepId { get; set; }
        public Guid GuideId { get; set; }
    }
}
