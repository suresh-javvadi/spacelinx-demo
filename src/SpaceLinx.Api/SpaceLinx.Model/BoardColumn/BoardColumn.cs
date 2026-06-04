namespace SpaceLinx.Model
{
    public partial class BoardColumn : BaseModel
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int Position { get; set; } = 0;
        public string Color { get; set; } = "#1976d2";
        public int? WipLimit { get; set; }
        public bool? IsDefault { get; set; } = false;
        public string? MapsToStatus { get; set; }

        // Navigation properties
        public virtual Project? Project { get; set; }
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}
