namespace SpaceLinx.Model
{
    public partial class InventoryPartPriceVw
    {
        public Guid? InventoryId { get; set; }
        public Guid? InventoryPartId { get; set; }
        public Guid? LocationId { get; set; }
        public Guid? BinId { get; set; }
        public string? SkuCode { get; set; }
        public int? ReorderLevel { get; set; }
        public decimal? InventoryUnitPrice { get; set; }
        public long? QtyOnhand { get; set; }
        public long? QtyReserved { get; set; }
        public long? QtyIssued { get; set; }
        public long? QtyQcPending { get; set; }
        public long? QtyQcFailed { get; set; }
        public long? QtyScrapped { get; set; }
        public long? QtyReturned { get; set; }
        public long? QtyAvailable { get; set; }
        public decimal? IssuedPrice { get; set; }
        public decimal? ReservedPrice { get; set; }
        public decimal? AvailablePrice { get; set; }
        public decimal? TotalPrice { get; set; }
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
        public decimal? PartUnitPrice { get; set; }
        public string? Status { get; set; }
        public string? ManufacturingPartNumber { get; set; }
        public bool? IsSerialNumberRequired { get; set; }
        public bool? PartIsActive { get; set; }
    }
}
