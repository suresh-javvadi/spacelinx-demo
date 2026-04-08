namespace SpaceLinx.Model
{
    public partial class TaskAssignee : BaseModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public string AssigneeRole { get; set; } = "Primary";
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual Task? Task { get; set; }
        public virtual User? User { get; set; }
    }
}
