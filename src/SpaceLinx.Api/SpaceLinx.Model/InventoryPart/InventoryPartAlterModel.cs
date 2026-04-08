namespace SpaceLinx.Model
{
    public partial class InventoryPartAlterModel 
    {
        public string? SkuCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public int ReorderLevel { get; set; }
        public int QtyOnhand { get; set; }
        public int QtyReserved { get; set; }
        public int? QtyAvailable { get; set; }
        public int ConsumedQuantity { get; set; }
        public List<InventoryStockAlterModel>? InventoryStocks { get; set; }
    }
}