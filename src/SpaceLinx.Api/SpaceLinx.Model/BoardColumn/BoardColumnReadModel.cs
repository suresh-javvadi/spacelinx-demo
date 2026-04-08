namespace SpaceLinx.Model
{
    public partial class BoardColumnReadModel : BaseReadModel
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int Position { get; set; }
        public string Color { get; set; } = "#1976d2";
        public int? WipLimit { get; set; }
        public bool IsDefault { get; set; }
        public string? MapsToStatus { get; set; }

        // Navigation properties as RefModels
        public virtual ProjectRefModel? Project { get; set; }

        // Task count for WIP limit tracking
        public int TaskCount { get; set; }
    }
}
