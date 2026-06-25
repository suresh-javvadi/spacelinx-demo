namespace SpaceLinx.Model;

public partial class Part : BaseModel
{
    public string? Number { get; set; }
    public string Name { get; set; } = null!;
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public Guid PartTypeId { get; set; }
    public double Weight { get; set; }
    public string? PartNumberSuffix { get; set; }
    public string Version { get; set; } = null!;
    public string? PartNumber { get; set; }
    public Guid? EcoId { get; set; }
    public string? Status { get; set; }
    public Guid? UnitOfMeasureId { get; set; }
    public int MakeBuy { get; set; }
    public bool IsSerialNumberRequired { get; set; }
    public decimal? UnitPrice { get; set; }
    public string? ManufacturingPartNumber { get; set; }
    public string? ManufacturerName { get; set; }
    public int? Trl { get; set; }
    public bool? SpaceQualified { get; set; }
    public string? ItemType { get; set; }
    public string? ReferenceNumber { get; set; }
    public bool HasBom { get; set; }
    public string? Material { get; set; }
    public string? Grade { get; set; }
    public Guid? CountryOfOriginId { get; set; }
    public Guid? SubsystemId { get; set; }
    public string? Specification { get; set; }
    public string? Package { get; set; }
    public string? Qualification { get; set; }
    public string? HsnCode { get; set; }
    public string? RadiationTolerance { get; set; }
    public string? TempRange { get; set; }
    public string? TempCoefficient { get; set; }
    public virtual Country? CountryOfOrigin { get; set; }
    public virtual Subsystem? Subsystem { get; set; }
    public virtual ICollection<Ebom> EbomChildParts { get; set; } = new List<Ebom>();
    public virtual ICollection<Ebom> EbomParts { get; set; } = new List<Ebom>();
    public virtual Eco? Eco { get; set; }
    public virtual ICollection<EcoPart> EcoParts { get; set; } = new List<EcoPart>();
    public virtual ICollection<GrnLineItem> GrnLineItems { get; set; } = new List<GrnLineItem>();
    public virtual ICollection<GuideEbom> GuideEbomChildParts { get; set; } = new List<GuideEbom>();
    public virtual ICollection<GuideEbom> GuideEbomParts { get; set; } = new List<GuideEbom>(); 
    public virtual ICollection<GuideMbom> GuideMboms { get; set; } = new List<GuideMbom>();
    public virtual ICollection<GuideStepEquipment> GuideStepEquipments { get; set; } = new List<GuideStepEquipment>();
    public virtual ICollection<Guide> Guides { get; set; } = new List<Guide>();
    public virtual ICollection<InventoryPart> InventoryParts { get; set; } = new List<InventoryPart>();
    public virtual ICollection<InventoryStock> InventoryStocks { get; set; } = new List<InventoryStock>();
    public virtual ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public virtual ICollection<KitBomComment> KitBomComments { get; set; } = new List<KitBomComment>();
    public virtual ICollection<KitSerial> KitSerials { get; set; } = new List<KitSerial>();
    public virtual ICollection<Kit> Kits { get; set; } = new List<Kit>();
    public virtual ICollection<MaterialKit> MaterialKits { get; set; } = new List<MaterialKit>();
    public virtual PartType PartType { get; set; } = null!;
    public virtual ICollection<PoLineItem> PoLineItems { get; set; } = new List<PoLineItem>();
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    public virtual ICollection<RequisitionLineItem> RequisitionLineItems { get; set; } = new List<RequisitionLineItem>();
    public virtual ICollection<ScrapLineItem> ScrapLineItems { get; set; } = new List<ScrapLineItem>();
    public virtual ICollection<StockMovementLineItem> StockMovementLineItems { get; set; } = new List<StockMovementLineItem>();
    public virtual UnitOfMeasure? UnitOfMeasure { get; set; }
    public virtual ICollection<VendorReturnLineItem> VendorReturnLineItems { get; set; } = new List<VendorReturnLineItem>();
    public virtual ICollection<CompanyPart> CompanyParts { get; set; } = new List<CompanyPart>();
    public virtual ICollection<WorkOrder> WorkOrders { get; set; } = new List<WorkOrder>();
    public virtual ICollection<WorkPackage> WorkPackages { get; set; } = new List<WorkPackage>();
}