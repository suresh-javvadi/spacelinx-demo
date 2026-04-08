namespace SpaceLinx.Model
{
    public partial class ResourceAllocation : BaseModel
    {
        public Guid UserId { get; set; }
        public Guid ProjectId { get; set; }
        public Guid? TaskId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal AllocatedHoursPerDay { get; set; } = 8.0m;
        public int AllocationPercent { get; set; } = 100;
        public string AllocationType { get; set; } = "Project";
        public string? Notes { get; set; }

        // Navigation properties
        public virtual User? User { get; set; }
        public virtual Project? Project { get; set; }
        public virtual Task? Task { get; set; }
    }
}
