namespace SpaceLinx.Model;

public partial class CompanyPart : BaseModel
{
    public Guid CompanyId { get; set; }
    public Guid PartId { get; set; }

    // PLM Industry Standard Fields
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

    // Navigation properties
    public virtual Part Part { get; set; } = null!;
    public virtual Company Company { get; set; } = null!;
    public virtual Currency? Currency { get; set; }
}