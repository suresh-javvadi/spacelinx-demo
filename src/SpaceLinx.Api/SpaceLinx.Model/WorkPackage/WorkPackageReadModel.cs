namespace SpaceLinx.Model
{
    public partial class WorkPackageReadModel : BaseReadModel
    {       
        public int Sequence { get; set; }
        public string Name { get; set; } = null!;
        public string Number { get; set; } = null!;
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
        public string Status { get; set; } = null!;
        public virtual Guide Guide { get; set; } = null!;
        public virtual User? Manager { get; set; }
        public virtual Part Part { get; set; } = null!;
        public virtual Product? Product { get; set; }
        public virtual User? Technician { get; set; }
    }
}
