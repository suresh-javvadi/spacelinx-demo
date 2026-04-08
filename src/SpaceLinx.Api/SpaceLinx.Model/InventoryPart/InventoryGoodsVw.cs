namespace SpaceLinx.Model
{
    public partial class InventoryGoodsVw
    {
        public Guid? InventoryId { get; set; }
        public Guid? InventoryPartId { get; set; }
        public string? SkuCode { get; set; }
        public int? ReorderLevel { get; set; }
        public int? InventoryUnitPrice { get; set; }
        public int? QtyOnhand { get; set; }
        public int? QtyReserved { get; set; }
        public int? QtyAvailable { get; set; }
        public int? ConsumedQuantity { get; set; }
        public bool? InventoryIsActive { get; set; }
        public DateTime? InventoryCreatedAt { get; set; }
        public string? InventoryCreatedBy { get; set; }
        public DateTime? InventoryUpdatedAt { get; set; }
        public string? InventoryUpdatedBy { get; set; }
        public Guid? PartId { get; set; }
        public string? PartNumber { get; set; }
        public Guid? PartTypeId { get; set; }
        public string? PartNumberSuffix { get; set; }
        public string? Version { get; set; }
        public string? PartName { get; set; }
        public string? Description { get; set; }
        public double? Weight { get; set; }
        public int? PartUnitPrice { get; set; }
        public string? Status { get; set; }
        public string? ManufacturingPartNumber { get; set; }
        public bool? IsSerialNumberRequired { get; set; }
        public bool? PartIsActive { get; set; }
        public string? ItemType { get; set; }
    }
}