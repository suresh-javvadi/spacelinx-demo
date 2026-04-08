namespace SpaceLinx.Model
{
    public class InventoryPartDetailsUpdateModel
    {
        public string? SkuCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public int ReorderLevel { get; set; }
    }
}
