namespace SpaceLinx.Model
{ 
    public partial class GuideCheckOutHistoryRefModel:BaseRefModel
    {
        public Guid GuideId { get; set; }
        public bool IsCheckedOut { get; set; }
        public string CreatedBy { get; set; } = null!;
    }
}