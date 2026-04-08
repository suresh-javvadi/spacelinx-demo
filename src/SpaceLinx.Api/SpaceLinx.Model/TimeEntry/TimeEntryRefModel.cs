namespace SpaceLinx.Model
{
    public partial class TimeEntryRefModel : BaseRefModel
    {
        public Guid TaskId { get; set; }
        public Guid UserId { get; set; }
        public DateTime EntryDate { get; set; }
        public decimal HoursWorked { get; set; }
        public bool Billable { get; set; }
    }
}
