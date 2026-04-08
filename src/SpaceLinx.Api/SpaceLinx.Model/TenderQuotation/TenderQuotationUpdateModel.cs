using System.ComponentModel.DataAnnotations;

namespace SpaceLinx.Model;

public partial class TenderQuotationUpdateModel : BaseUpdateModel
{
    public Guid TenderId { get; set; }

    [Required]
    public Guid CompanyId { get; set; }

    [MaxLength(100)]
    public string? QuotationNumber { get; set; }

    [Required]
    public DateOnly QuotationDate { get; set; }

    public DateOnly? ValidUntil { get; set; }

    [Required]
    public decimal TotalAmount { get; set; }

    public Guid? CurrencyId { get; set; }
    public int? LeadTimeDays { get; set; }
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    public Guid? DocumentId { get; set; }
}
