using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model
{
    public partial class TimeEntryWriteModel : BaseWriteModel
    {
        [Required]
        public Guid TaskId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public DateTime EntryDate { get; set; }

        [Required]
        [Range(0.01, 24, ErrorMessage = "Hours worked must be between 0.01 and 24")]
        public decimal HoursWorked { get; set; }

        public string? Description { get; set; }

        public bool Billable { get; set; } = true;

        public string WorkType { get; set; } = "Development";
    }
}
