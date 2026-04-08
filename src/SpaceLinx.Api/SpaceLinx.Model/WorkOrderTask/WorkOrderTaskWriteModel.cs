namespace SpaceLinx.Model
{
    public partial class WorkOrderTaskWriteModel : BaseWriteModel
    {
        public Guid WorkOrderId { get; set; }
        public Guid? WorkOrderStepId { get; set; }
        public Guid GuideStepTaskId { get; set; }
        public string? TaskResponse { get; set; }
    }
}
