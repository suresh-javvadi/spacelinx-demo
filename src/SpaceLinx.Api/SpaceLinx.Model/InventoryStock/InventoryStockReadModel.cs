namespace SpaceLinx.Model
{
    public partial class InventoryStockReadModel : BaseReadModel
    {
        public Guid PartId { get; set; }
        public Guid? BinId { get; set; }
        public Guid? LocationId { get; set; }
        public string? TrackingType { get; set; }
        public string? TrackingId { get; set; }
        public string? HsnCode { get; set; }
        public int QtyOnhand { get; set; }
        public int QtyAvailable { get; set; }
        public int QtyIssued { get; set; }
        public int QtyReserved { get; set; }
        public int QtyConsumed { get; set; }
        public int QtyQcPending { get; set; }
        public int QtyQcFailed { get; set; }
        public int QtyScrapped { get; set; }
        public int QtyReturned { get; set; }
        public int OpeningQty { get; set; }
        public decimal? OpeningPrice { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? CurrencyConversion { get; set; }
        public Guid? ProjectId { get; set; }
        public string? Department { get; set; }
        public Guid? AssignedUserId { get; set; }
        public decimal? ConversionRate { get; set; }
        public decimal? IssuedPrice { get; set; }
        public decimal? ReservedPrice { get; set; }
        public decimal? AvailablePrice { get; set; }
        public decimal? TotalPrice { get; set; }
        public virtual LocationRefModel? Location { get; set; }
        public virtual BinManagementRefModel? Bin { get; set; }
        public virtual PartRefModel Part { get; set; } = null!;
        public virtual ProjectRefModel? Project { get; set; }
        public virtual UserRefModel? AssignedUser { get; set; }
    }
}