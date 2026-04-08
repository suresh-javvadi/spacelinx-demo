namespace SpaceLinx.Model
{
    public class DashboardWidgetRefModel : BaseRefModel
    {
        public string WidgetType { get; set; } = null!;
        public string? Title { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }
}
