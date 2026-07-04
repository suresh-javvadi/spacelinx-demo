namespace SpaceLinx.Model
{
    /// <summary>
    /// Keyless result row for the inventory stock movement report.
    /// Hydrated exclusively via FromSqlRaw over sc.inventory_stock_report(p_start, p_end, p_part_id);
    /// it is not mapped to a table or view.
    /// </summary>
    public partial class InventoryStockReportRow
    {
        public string? PartNo { get; set; }
        public string? PartName { get; set; }
        public decimal? OpeningQty { get; set; }
        public decimal? PurchaseQty { get; set; }
        public decimal? ConsumptionQty { get; set; }
        public decimal? ClosingQty { get; set; }
        public decimal? ConsumptionAmount { get; set; }
        public decimal? ClosingBalance { get; set; }
    }
}
