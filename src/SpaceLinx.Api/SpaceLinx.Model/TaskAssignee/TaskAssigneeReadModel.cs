namespace SpaceLinx.Model
{
    public partial class TaskAssigneeReadModel : BaseReadModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public string AssigneeRole { get; set; } = "Primary";
        public DateTime AssignedAt { get; set; }

        // Navigation properties as RefModels
        public virtual TaskRefModel? Task { get; set; }
        public virtual UserRefModel? User { get; set; }
    }
}
