namespace SpaceLinx.Model
{
    public partial class TaskDependencyReadModel : BaseReadModel
    {
        public Guid PredecessorTaskId { get; set; }
        public Guid SuccessorTaskId { get; set; }
        public string DependencyType { get; set; } = "FS";
        public int LagDays { get; set; }

        // Navigation properties as RefModels
        public virtual TaskRefModel? PredecessorTask { get; set; }
        public virtual TaskRefModel? SuccessorTask { get; set; }
    }
}
