namespace SpaceLinx.Model
{
    public class DashboardWidgetReadModel : BaseReadModel
    {
        public Guid UserId { get; set; }
        public string WidgetType { get; set; } = null!;
        public string? Title { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string? Settings { get; set; }
        public Guid? ProjectId { get; set; }
        public ProjectRefModel? Project { get; set; }
    }
}
