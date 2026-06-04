namespace SpaceLinx.Model
{
    public partial class TimeEntry : BaseModel
    {
    // UAT: created_at / is_active are NULLABLE on this table. BaseModel declares them non-nullable;
    // shadow as nullable so the EF column matches UAT exactly. DB defaults (CURRENT_TIMESTAMP / true)
    // populate them on insert; the generic controller deactivate/remove writes IsActive via the EF entry.
    public new DateTime? CreatedAt { get; set; }
    public new bool? IsActive { get; set; }

        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public DateTime EntryDate { get; set; }
        public decimal HoursWorked { get; set; }
        public string? Description { get; set; }
        public bool? Billable { get; set; } = true;
        public string? WorkType { get; set; } = "Development";

        // Navigation properties
        public virtual Task? Task { get; set; }
        public virtual User? User { get; set; }
    }
}
