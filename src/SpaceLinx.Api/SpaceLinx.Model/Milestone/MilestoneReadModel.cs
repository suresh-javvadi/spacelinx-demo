namespace SpaceLinx.Model
{
    public partial class MilestoneReadModel : BaseReadModel
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public Guid? ProjectId { get; set; }
        public DateTime? TargetDate { get; set; }
        public string Status { get; set; } = null!;
        public virtual ProjectRefModel? Project { get; set; }
    }
}