namespace SpaceLinx.Model
{
    public partial class TaskDependencyWriteModel : BaseWriteModel
    {
        public Guid PredecessorTaskId { get; set; }
        public Guid SuccessorTaskId { get; set; }
        public string DependencyType { get; set; } = "FS";
        public int LagDays { get; set; } = 0;
    }
}
