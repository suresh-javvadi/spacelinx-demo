namespace SpaceLinx.Model
{
    public partial class TaskActivity
    {
        public Guid? Id { get; set; }
        public Guid TaskId { get; set; }
        public string ActivityType { get; set; } = null!;
        public string? FieldChanged { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = null!;

        // Navigation property
        public virtual Task? Task { get; set; }
    }
}
