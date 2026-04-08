namespace SpaceLinx.Model
{
    public partial class TaskComment : BaseModel
    {
        public Guid TaskId { get; set; }
        public Guid? ParentCommentId { get; set; }
        public string Content { get; set; } = null!;
        public string? Mentions { get; set; }

        // Navigation properties
        public virtual Task? Task { get; set; }
        public virtual TaskComment? ParentComment { get; set; }
        public virtual ICollection<TaskComment> Replies { get; set; } = new List<TaskComment>();
    }
}
