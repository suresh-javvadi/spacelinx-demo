namespace SpaceLinx.Model
{
    public partial class InventoryPartWriteModel : BaseWriteModel
    {
        public Guid PartId { get; set; }
        public Guid? LocationId { get; set; }
        public Guid? BinId { get; set; }
        public string? SkuCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public int ReorderLevel { get; set; }
        public int QtyOnhand { get; set; }
        public int QtyReserved { get; set; }
        public int? QtyAvailable { get; set; }
        public int ConsumedQuantity { get; set; }
        public int QtyIssued { get; set; }
        public int QtyQcPending { get; set; }
        public int QtyScrapped { get; set; }
        public int QtyQcFailed { get; set; }
        public int QtyReturned { get; set; }
        public string? TrackingType { get; set; }
    }
}