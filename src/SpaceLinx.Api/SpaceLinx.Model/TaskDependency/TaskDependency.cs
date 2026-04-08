namespace SpaceLinx.Model
{
    public partial class TaskDependency : BaseModel
    {
        public Guid PredecessorTaskId { get; set; }
        public Guid SuccessorTaskId { get; set; }
        public string DependencyType { get; set; } = "FS";
        public int LagDays { get; set; } = 0;

        // Navigation properties
        public virtual Task? PredecessorTask { get; set; }
        public virtual Task? SuccessorTask { get; set; }
    }
}
