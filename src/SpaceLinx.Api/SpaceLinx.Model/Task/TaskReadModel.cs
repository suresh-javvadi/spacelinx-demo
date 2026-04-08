namespace SpaceLinx.Model
{
    public partial class TaskReadModel : BaseReadModel
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
        public int ProgressPercent { get; set; }
        public string TaskType { get; set; } = "Task";
        public int SortOrder { get; set; }
        public Guid? BoardColumnId { get; set; }

        // Navigation properties as RefModels
        public virtual UserRefModel? AssignedTo { get; set; }
        public virtual MilestoneRefModel? Milestone { get; set; }
        public virtual ProjectRefModel? Project { get; set; }
        public virtual TaskRefModel? ParentTask { get; set; }
        public virtual BoardColumnRefModel? BoardColumn { get; set; }

        // Collections
        public virtual ICollection<TaskRefModel>? SubTasks { get; set; }
        public virtual ICollection<TaskAssigneeRefModel>? Assignees { get; set; }
    }
}
