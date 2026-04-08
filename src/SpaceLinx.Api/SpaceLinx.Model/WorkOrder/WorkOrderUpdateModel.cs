namespace SpaceLinx.Model
{
    public partial class WorkOrderUpdateModel : BaseUpdateModel
    {
        public Guid? KitId { get; set; }
        public Guid? TechnicianId { get; set; }
        public Guid? ManagerId { get; set; }
        public Guid? ProductId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
        public TimeSpan? ExecutionTime { get; set; }
    }
}