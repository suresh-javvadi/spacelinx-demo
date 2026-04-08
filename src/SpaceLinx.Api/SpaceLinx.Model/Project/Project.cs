namespace SpaceLinx.Model
{
    public partial class Project : BaseModel
    {
        public string ProjectCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public Guid? ProgramId { get; set; }
        public Guid? ProjectManagerId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public decimal? Budget { get; set; }
        public virtual Program? Program { get; set; }
        public virtual User? ProjectManager { get; set; }
        public virtual ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
        public virtual ICollection<Requisition> Requisitions { get; set; } = new List<Requisition>();
        public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    }
}