namespace SpaceLinx.Model
{
    public partial class BoardColumnRefModel : BaseRefModel
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public int Position { get; set; }
        public string Color { get; set; } = "#1976d2";
        public string? MapsToStatus { get; set; }
    }
}
