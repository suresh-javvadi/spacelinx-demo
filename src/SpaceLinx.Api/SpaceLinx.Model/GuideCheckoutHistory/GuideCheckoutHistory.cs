namespace SpaceLinx.Model
{
    public partial class GuideCheckOutHistory : BaseModel
    {
        public Guid GuideId { get; set; }
        public bool IsCheckedOut { get; set; }
        public virtual Guide Guide { get; set; } = null!;
    }
}