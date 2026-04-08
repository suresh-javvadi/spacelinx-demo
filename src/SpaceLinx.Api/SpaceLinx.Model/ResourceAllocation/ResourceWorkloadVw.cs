namespace SpaceLinx.Model
{
    public partial class ResourceWorkloadVw
    {
        public Guid? UserId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? ImageUrl { get; set; }
        public string? Department { get; set; }
        public string? JobTitle { get; set; }
        public string? CurrentAllocations { get; set; }
        public long? TodayAllocationPercent { get; set; }
        public long? ActiveTasksCount { get; set; }
        public long? PrimaryAssignmentsCount { get; set; }
        public decimal? HoursLoggedThisWeek { get; set; }
        public decimal? HoursLoggedThisMonth { get; set; }
        public long? OverdueTasksCount { get; set; }
    }
}
