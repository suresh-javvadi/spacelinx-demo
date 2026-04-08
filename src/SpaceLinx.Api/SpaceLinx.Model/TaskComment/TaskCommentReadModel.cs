namespace SpaceLinx.Model
{
    public partial class TaskCommentReadModel : BaseReadModel
    {
        public Guid TaskId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public string? Mentions { get; set; }

        // Navigation properties as RefModels
        public virtual TaskRefModel? Task { get; set; }
        public virtual TaskCommentRefModel? ParentComment { get; set; }
        public virtual ICollection<TaskCommentRefModel>? Replies { get; set; }
    }
}
