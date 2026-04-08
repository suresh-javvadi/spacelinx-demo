namespace SpaceLinx.Model
{
    public partial class TaskWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? AssignedToId { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? DueDate { get; set; }
        public string Priority { get; set; } = null!;
        public Guid? MilestoneId { get; set; }

        // New properties for enhanced task management
        public Guid? ParentTaskId { get; set; }
        public DateTime? StartDate { get; set; }
        public decimal? EstimatedHours { get; set; }
        public string TaskType { get; set; } = "Task";
        public int SortOrder { get; set; } = 0;
        public Guid? BoardColumnId { get; set; }
    }
}
