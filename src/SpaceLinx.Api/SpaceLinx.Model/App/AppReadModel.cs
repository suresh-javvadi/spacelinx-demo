namespace SpaceLinx.Model
{
    public partial class AppReadModel : BaseReadModel
    {
        public int AppNumber { get; set; }
        public string AppName { get; set; } = null!;
        public string? Description { get; set; }
    }
}