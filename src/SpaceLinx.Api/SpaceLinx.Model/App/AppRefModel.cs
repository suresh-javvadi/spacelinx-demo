namespace SpaceLinx.Model
{
    public partial class AppRefModel : BaseRefModel
    {
        public int AppNumber { get; set; }
        public string AppName { get; set; } = null!;
        public string? Description { get; set; }
    }
}