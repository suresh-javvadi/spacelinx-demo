namespace SpaceLinx.Model
{
    public partial class DashboardWidget : BaseModel
    {
        public Guid UserId { get; set; }
        public string WidgetType { get; set; } = null!;
        public string? Title { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int Width { get; set; } = 4;
        public int Height { get; set; } = 2;
        public string? Settings { get; set; }
        public Guid? ProjectId { get; set; }

        // Navigation properties
        public virtual Project? Project { get; set; }
    }
}
