namespace SpaceLinx.Model
{
    public partial class GuideStepTaskUpdateModel : BaseUpdateModel
    {
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string? Taskdetails { get; set; }
        public string? Description { get; set; }
        public int Ismandatory { get; set; }
        public int? Sequence { get; set; }
    }
}
