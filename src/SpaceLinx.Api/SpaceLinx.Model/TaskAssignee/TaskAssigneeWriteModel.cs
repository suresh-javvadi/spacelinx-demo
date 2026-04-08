namespace SpaceLinx.Model
{
    public partial class TaskAssigneeWriteModel : BaseWriteModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public string AssigneeRole { get; set; } = "Primary";
    }
}
