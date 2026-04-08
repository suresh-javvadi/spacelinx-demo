namespace SpaceLinx.Model
{
    public partial class Program : BaseModel
    {
        public string ProgramCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Guid? CustomerId { get; set; }
        public Guid? ProgramManagerId { get; set; }
        public Guid? SupplyChainManagerId { get; set; }
        public Guid? BuyerId { get; set; }
        public string? Status { get; set; }
        public string? Goals { get; set; }
        public decimal? Budget { get; set; }
        public decimal? ActualSpend { get; set; }
        public virtual User? Buyer { get; set; }
        public virtual Customer? Customer { get; set; }
        public virtual User? ProgramManager { get; set; }
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual User? SupplyChainManager { get; set; }
    }
}