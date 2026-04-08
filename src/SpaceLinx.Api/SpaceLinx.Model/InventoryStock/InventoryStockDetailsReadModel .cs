namespace SpaceLinx.Model
{
    public class InventoryStockDetailsReadModel : BaseReadModel
    {
        public Guid PartId { get; set; }
        public string PartNumber { get; set; } = null!;
        public string PartName { get; set; } = null!;
        public Guid? BinId { get; set; }
        public string? BinCode { get; set; }
        public string? TrackingType { get; set; }
        public string? TrackingId { get; set; }
        public int QtyOnhand { get; set; }
        public int QtyAvailable { get; set; }
        public int? QtyIssued { get; set; }
        public int QtyReserved { get; set; }
        public int QtyConsumed { get; set; }
        public int QtyQcPending { get; set; }
        public int QtyQcFailed { get; set; }
        public int QtyScrapped { get; set; }
        public int QtyReturned { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? ConversionRate { get; set; }
    }
}
