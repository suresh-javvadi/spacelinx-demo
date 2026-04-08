namespace SpaceLinx.Model
{
    public partial class WorkOrderTaskReadModel : BaseReadModel
    {
        public Guid WorkOrderId { get; set; }
        public Guid GuideStepTaskId { get; set; }
        public string? TaskResponse { get; set; }
        public string Status { get; set; } = null!;
        public Guid? WorkOrderStepId { get; set; }
        public virtual GuideStepTaskRefModel GuideStepTask { get; set; } = null!;
        public virtual WorkOrderRefModel WorkOrder { get; set; } = null!;
        public virtual WorkOrderStepRefModel? WorkOrderStep { get; set; }
    }
}
