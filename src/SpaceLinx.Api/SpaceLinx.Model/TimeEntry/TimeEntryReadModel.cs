namespace SpaceLinx.Model
{
    public partial class TimeEntryReadModel : BaseReadModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public DateTime EntryDate { get; set; }
        public decimal HoursWorked { get; set; }
        public string? Description { get; set; }
        public bool Billable { get; set; }
        public string WorkType { get; set; } = "Development";

        // Navigation properties as RefModels
        public virtual TaskRefModel? Task { get; set; }
        public virtual UserRefModel? User { get; set; }
    }
}
