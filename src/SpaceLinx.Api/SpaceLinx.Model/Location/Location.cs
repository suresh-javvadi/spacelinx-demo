namespace SpaceLinx.Model;

public partial class Location : BaseModel
{
    public string Number { get; set; } = null!;
    public string Name { get; set; } = null!;
    public virtual ICollection<BinManagement> BinManagements { get; set; } = new List<BinManagement>();
    public virtual ICollection<GoodsReceiptNote> GoodsReceiptNotes { get; set; } = new List<GoodsReceiptNote>();
    public virtual ICollection<InventoryPart> InventoryParts { get; set; } = new List<InventoryPart>();
    public virtual ICollection<InventoryStock> InventoryStocks { get; set; } = new List<InventoryStock>();
    public virtual ICollection<InventoryTransaction> InventoryTransactionFromLocations { get; set; } = new List<InventoryTransaction>();
    public virtual ICollection<InventoryTransaction> InventoryTransactionToLocations { get; set; } = new List<InventoryTransaction>();
    public virtual ICollection<Kit> Kits { get; set; } = new List<Kit>();
    public virtual ICollection<MaterialKit> MaterialKits { get; set; } = new List<MaterialKit>();
    public virtual ICollection<ScrapRequest> ScrapRequests { get; set; } = new List<ScrapRequest>();
    public virtual ICollection<StockMovement> StockMovementFromLocations { get; set; } = new List<StockMovement>();
    public virtual ICollection<StockMovement> StockMovementToLocations { get; set; } = new List<StockMovement>();
    public virtual ICollection<VendorReturnRequest> VendorReturnRequests { get; set; } = new List<VendorReturnRequest>();
}