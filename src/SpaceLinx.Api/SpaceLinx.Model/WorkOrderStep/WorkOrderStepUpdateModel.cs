namespace SpaceLinx.Model
{
    public partial class WorkOrderStepUpdateModel : BaseUpdateModel
    {
        public Guid? TechnicianId { get; set; }
        public Guid? ManagerId { get; set; }
        public long CapturedTimeInSeconds { get; set; }
        public string? Comment { get; set; }
    }
}
