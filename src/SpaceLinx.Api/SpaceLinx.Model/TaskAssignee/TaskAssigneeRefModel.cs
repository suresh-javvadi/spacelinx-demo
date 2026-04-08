namespace SpaceLinx.Model
{
    public partial class TaskAssigneeRefModel : BaseRefModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public string AssigneeRole { get; set; } = "Primary";
        public DateTime AssignedAt { get; set; }

        // Include User info for display
        public virtual UserRefModel? User { get; set; }
    }
}
