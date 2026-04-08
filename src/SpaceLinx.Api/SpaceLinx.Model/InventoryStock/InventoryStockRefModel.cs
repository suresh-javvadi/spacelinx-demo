namespace SpaceLinx.Model
{
    public partial class InventoryStockRefModel : BaseRefModel
    {
        public Guid PartId { get; set; }
        public Guid? BinId { get; set; }
        public Guid? LocationId { get; set; }
        public string? TrackingType { get; set; }
        public string? TrackingId { get; set; }
        public int QtyOnhand { get; set; }
        public int QtyAvailable { get; set; }
        public int QtyReserved { get; set; }
        public int QtyConsumed { get; set; }
        public int QtyIssued { get; set; }
    }
}