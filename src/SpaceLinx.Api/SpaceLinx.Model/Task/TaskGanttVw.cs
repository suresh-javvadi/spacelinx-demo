namespace SpaceLinx.Model
{
    public partial class TaskGanttVw
    {
        public Guid? Id { get; set; }
        public string? TaskCode { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? ParentTaskId { get; set; }
        public string? Status { get; set; }
        public string? Priority { get; set; }
        public string? TaskType { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? DueDate { get; set; }
        public int? ProgressPercent { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public int? SortOrder { get; set; }
        public Guid? AssignedToId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? ProjectName { get; set; }
        public string? ProjectCode { get; set; }
        public string? AssigneeFirstName { get; set; }
        public string? AssigneeLastName { get; set; }
        public string? AssigneeEmail { get; set; }
        public string? ParentTaskName { get; set; }
        public string? ParentTaskCode { get; set; }
        public string? Dependencies { get; set; }
        public long? SubtaskCount { get; set; }
        public long? CompletedSubtaskCount { get; set; }
        public string? Assignees { get; set; }
    }
}
