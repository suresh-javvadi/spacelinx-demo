using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class CompanyPartUpdateModel : BaseUpdateModel
{
    [Required]
    public Guid CompanyId { get; set; }

    [Required]
    public Guid PartId { get; set; }

    public decimal? UnitPrice { get; set; }
    public Guid? CurrencyId { get; set; }
    public int? LeadTimeDays { get; set; }
    public int? MinOrderQuantity { get; set; }
    public int? OrderMultiple { get; set; }
    public bool IsPreferred { get; set; }
    public DateOnly? ValidFrom { get; set; }
    public DateOnly? ValidTo { get; set; }

    [MaxLength(255)]
    public string? VendorPartNumber { get; set; }

    [MaxLength(255)]
    public string? ManufacturerPartNumber { get; set; }

    public string? Notes { get; set; }
}