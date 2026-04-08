namespace SpaceLinx.Model
{
    public partial class TaskCommentWriteModel : BaseWriteModel
    {
        public Guid TaskId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public string? Mentions { get; set; }
    }
}
