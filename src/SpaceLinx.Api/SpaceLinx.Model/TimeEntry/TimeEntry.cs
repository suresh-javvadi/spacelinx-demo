namespace SpaceLinx.Model
{
    public partial class TimeEntry : BaseModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public DateTime EntryDate { get; set; }
        public decimal HoursWorked { get; set; }
        public string? Description { get; set; }
        public bool Billable { get; set; } = true;
        public string WorkType { get; set; } = "Development";

        // Navigation properties
        public virtual Task? Task { get; set; }
        public virtual User? User { get; set; }
    }
}
