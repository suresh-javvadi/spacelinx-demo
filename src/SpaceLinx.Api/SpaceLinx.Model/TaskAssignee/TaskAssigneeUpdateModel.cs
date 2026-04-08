namespace SpaceLinx.Model
{
    public partial class TaskAssigneeUpdateModel : BaseUpdateModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public string AssigneeRole { get; set; } = "Primary";
    }
}
