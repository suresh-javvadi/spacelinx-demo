namespace SpaceLinx.Model
{
    public partial class WorkPackageUpdateModel : BaseUpdateModel
    {
        public Guid? TechnicianId { get; set; }
        public Guid? ManagerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
    }
}
