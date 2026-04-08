namespace SpaceLinx.Model
{
    public partial class WorkOrderStepReadModel : BaseReadModel
    {
        public Guid WorkOrderId { get; set; }
        public Guid GuideStepId { get; set; }
        public Guid? TechnicianId { get; set; }
        public Guid? ManagerId { get; set; }
        public string Status { get; set; } = null!;
        public TimeSpan? ExecutionTime { get; set; }
        public TimeSpan? CapturedTime { get; set; }
        public long ExecutionTimeInSeconds { get; set; }
        public long CapturedTimeInSeconds { get; set; }
        public Guid? ImageId { get; set; }
        public string? Comment { get; set; }
        public virtual GuideStepRefModel GuideStep { get; set; } = null!;
        public virtual ImageRefModel? Image { get; set; }
        public virtual UserRefModel Manager { get; set; } = null!;
        public virtual UserRefModel? Technician { get; set; }
        public virtual WorkOrderRefModel WorkOrder { get; set; } = null!;
    }
}
