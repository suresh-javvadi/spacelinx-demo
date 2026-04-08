namespace SpaceLinx.Model
{
    public class ResourceAllocationReadModel : BaseReadModel
    {
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }
        public Guid? TaskId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal AllocatedHoursPerDay { get; set; }
        public int AllocationPercent { get; set; }
        public string AllocationType { get; set; } = null!;
        public string? Notes { get; set; }

        // Navigation properties
        public UserRefModel? User { get; set; }
        public ProjectRefModel? Project { get; set; }
        public TaskRefModel? Task { get; set; }
    }
}
