namespace SpaceLinx.Model
{
    public partial class WorkOrderStepRefModel : BaseRefModel
    {
        public Guid WorkOrderId { get; set; }
        public Guid GuideStepId { get; set; }
        public Guid? TechnicianId { get; set; }
        public Guid? ManagerId { get; set; }
        public string Status { get; set; } = null!;
        public Guid? ImageId { get; set; }
        public string? Comment { get; set; }
    }
}
