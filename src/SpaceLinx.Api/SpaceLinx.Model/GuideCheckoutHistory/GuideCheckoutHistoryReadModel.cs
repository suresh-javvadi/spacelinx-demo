namespace SpaceLinx.Model
{
    public partial class GuideCheckOutHistoryReadModel : BaseReadModel
    {
        public Guid GuideId { get; set; }
        public bool IsCheckedOut { get; set; }
        public virtual GuideRefModel Guide { get; set; } = null!;
    }
}