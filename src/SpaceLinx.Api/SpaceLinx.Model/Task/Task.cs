namespace SpaceLinx.Model
{
    public partial class Task : BaseModel
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
        public string? TaskCode { get; set; }
        public DateTime? StartDate { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public int? ProgressPercent { get; set; } = 0;
        public string? TaskType { get; set; } = "Task";
        public int? SortOrder { get; set; } = 0;
        public Guid? BoardColumnId { get; set; }

        // Navigation properties
        public virtual User? AssignedTo { get; set; }
        public virtual Milestone? Milestone { get; set; }
        public virtual Project? Project { get; set; }
        public virtual Task? ParentTask { get; set; }
        public virtual BoardColumn? BoardColumn { get; set; }

        // Collections
        public virtual ICollection<Task> SubTasks { get; set; } = new List<Task>();
        public virtual ICollection<TaskDependency> PredecessorDependencies { get; set; } = new List<TaskDependency>();
        public virtual ICollection<TaskDependency> SuccessorDependencies { get; set; } = new List<TaskDependency>();
        public virtual ICollection<TaskAssignee> Assignees { get; set; } = new List<TaskAssignee>();
        public virtual ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
        public virtual ICollection<TaskActivity> Activities { get; set; } = new List<TaskActivity>();
    }
}
