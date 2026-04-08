namespace SpaceLinx.Model
{
    public partial class ProgramUpdateModel : BaseUpdateModel
    {
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
    }
}