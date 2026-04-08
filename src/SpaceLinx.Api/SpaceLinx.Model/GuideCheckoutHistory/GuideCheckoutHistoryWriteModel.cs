namespace SpaceLinx.Model
{
    public partial class GuideCheckOutHistoryWriteModel:BaseWriteModel
    {
        public Guid GuideId { get; set; }
        public bool IsCheckedOut { get; set; }
    }
}