namespace SpaceLinx.Model;

public partial class CompanyPartReadModel : BaseReadModel
{
    public Guid CompanyId { get; set; }
    public Guid PartId { get; set; }
    public decimal? UnitPrice { get; set; }
    public Guid? CurrencyId { get; set; }
    public int? LeadTimeDays { get; set; }
    public int? MinOrderQuantity { get; set; }
    public int? OrderMultiple { get; set; }
    public bool IsPreferred { get; set; }
    public DateOnly? ValidFrom { get; set; }
    public DateOnly? ValidTo { get; set; }
    public string? VendorPartNumber { get; set; }
    public string? ManufacturerPartNumber { get; set; }
    public string? Notes { get; set; }

    public virtual PartRefModel Part { get; set; } = null!;
    public virtual CompanyRefModel Company { get; set; } = null!;
    public virtual CurrencyRefModel? Currency { get; set; }
}