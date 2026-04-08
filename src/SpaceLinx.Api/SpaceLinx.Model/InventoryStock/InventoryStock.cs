namespace SpaceLinx.Model
{
    public partial class InventoryStock : BaseModel
    {
        public Guid PartId { get; set; }
        public Guid? BinId { get; set; }
        public Guid? LocationId { get; set; }
        public string? TrackingType { get; set; }
        public string? TrackingId { get; set; }
        public int QtyOnhand { get; set; }
        public int QtyAvailable { get; set; }
        public int QtyReserved { get; set; }
        public int? QtyIssued { get; set; }
        public int QtyConsumed { get; set; }
        public int QtyQcPending { get; set; }
        public int QtyQcFailed { get; set; }
        public int QtyScrapped { get; set; }
        public int QtyReturned { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? Currency { get; set; }
        public Guid? ProjectId { get; set; }
        public string? Department { get; set; }
        public Guid? AssignedUserId { get; set; }
        public decimal? ConversionRate { get; set; }
        public decimal? IssuedPrice { get; set; }
        public decimal? ReservedPrice { get; set; }
        public decimal? AvailablePrice { get; set; }
        public decimal? TotalPrice { get; set; }
        public virtual Location? Location { get; set; }
        public virtual BinManagement? Bin { get; set; }
        public virtual Part Part { get; set; } = null!;
        public virtual Project? Project { get; set; }
        public virtual User? AssignedUser { get; set; }
    }
}