using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model
{
    public class ResourceAllocationWriteModel : BaseWriteModel
    {
        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid ProjectId { get; set; }

        public Guid? TaskId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Range(0.1, 24.0)]
        public decimal AllocatedHoursPerDay { get; set; } = 8.0m;

        [Range(1, 100)]
        public int AllocationPercent { get; set; } = 100;

        [StringLength(50)]
        public string AllocationType { get; set; } = "Project";

        public string? Notes { get; set; }
    }
}
