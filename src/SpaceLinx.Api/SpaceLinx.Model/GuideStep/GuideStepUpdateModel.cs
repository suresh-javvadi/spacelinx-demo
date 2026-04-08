namespace SpaceLinx.Model
{
    public partial class GuideStepUpdateModel : BaseUpdateModel
    {
        public string Title { get; set; } = null!;
         public string? Comment { get; set; }
    }
}
