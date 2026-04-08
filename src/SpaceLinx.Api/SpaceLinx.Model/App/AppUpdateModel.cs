namespace SpaceLinx.Model
{
    public partial class AppUpdateModel : BaseUpdateModel
    {
        public string AppName { get; set; } = null!;
        public string? Description { get; set; }
    }
}