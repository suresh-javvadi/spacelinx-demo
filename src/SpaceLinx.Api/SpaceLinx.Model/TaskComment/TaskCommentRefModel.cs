namespace SpaceLinx.Model
{
    public partial class TaskCommentRefModel : BaseRefModel
    {
        public Guid TaskId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public string? Mentions { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; } = null!;
    }
}
