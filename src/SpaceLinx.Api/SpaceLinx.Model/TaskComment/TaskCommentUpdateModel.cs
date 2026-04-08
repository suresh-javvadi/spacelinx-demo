namespace SpaceLinx.Model
{
    public partial class TaskCommentUpdateModel : BaseUpdateModel
    {
        public Guid TaskId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public string? Mentions { get; set; }
    }
}
