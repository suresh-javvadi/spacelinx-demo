namespace SpaceLinx.Model
{
    public partial class BinManagement : BaseModel
    {
        public Guid? LocationId { get; set; }
        public string BinCode { get; set; } = null!;
        public string? Aisle { get; set; }
        public string? Rack { get; set; }
        public int? Capacity { get; set; }
        public Guid? UnitOfMeasureId { get; set; }
        public virtual ICollection<InventoryPart> InventoryParts { get; set; } = new List<InventoryPart>();
        public virtual ICollection<InventoryStock> InventoryStocks { get; set; } = new List<InventoryStock>();
        public virtual Location? Location { get; set; } = null!;
        public virtual UnitOfMeasure? UnitOfMeasure { get; set; }
    }
}