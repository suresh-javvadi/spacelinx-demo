namespace SpaceLinx.Model
{
    public partial class WorkPackageWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public int Quantity { get; set; }
        public Guid? TechnicianId { get; set; }
        public Guid? ManagerId { get; set; }
        public Guid? GuideId { get; set; }
        public Guid PartId { get; set; }
        public Guid? ProductId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? ActualStartDate { get; set; }
        public DateTime? ActualEndDate { get; set; }
    }
}
