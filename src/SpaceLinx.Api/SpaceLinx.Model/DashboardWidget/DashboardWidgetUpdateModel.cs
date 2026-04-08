using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model
{
    public class DashboardWidgetUpdateModel : BaseUpdateModel
    {
        [Required]
        [StringLength(50)]
        public string WidgetType { get; set; } = null!;

        [StringLength(100)]
        public string? Title { get; set; }

        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public int Width { get; set; } = 4;
        public int Height { get; set; } = 2;
        public string? Settings { get; set; }
        public Guid? ProjectId { get; set; }
    }
}
