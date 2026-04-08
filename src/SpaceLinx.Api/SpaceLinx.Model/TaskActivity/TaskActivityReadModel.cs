namespace SpaceLinx.Model
{
    public partial class TaskActivityReadModel
    {
        public Guid? Id { get; set; }
        public Guid TaskId { get; set; }
        public string ActivityType { get; set; } = null!;
        public string? FieldChanged { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = null!;

        // Task reference for context
        public virtual TaskRefModel? Task { get; set; }
    }
}
