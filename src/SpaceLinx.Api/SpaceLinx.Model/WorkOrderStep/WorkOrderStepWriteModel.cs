namespace SpaceLinx.Model
{
    public partial class WorkOrderStepWriteModel : BaseWriteModel
    {
        public Guid WorkOrderId { get; set; }
        public Guid? GuideStepId { get; set; }
        public Guid? TechnicianId { get; set; }
        public Guid ManagerId { get; set; }
        public long CapturedTimeInSeconds { get; set; }
        public string? Comment { get; set; }
    }
}
