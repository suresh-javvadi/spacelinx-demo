namespace SpaceLinx.Model;

public partial class TenderQuotation : BaseModel
{
    public Guid TenderId { get; set; }
    public Guid? CompanyId { get; set; }
    public string? QuotationNumber { get; set; }
    public DateOnly QuotationDate { get; set; }
    public DateOnly? ValidUntil { get; set; }
    public decimal TotalAmount { get; set; }
    public Guid? CurrencyId { get; set; }
    public int? LeadTimeDays { get; set; }
    public string? Notes { get; set; }
    public string? TermsAndConditions { get; set; }
    public Guid? DocumentId { get; set; }
    public bool IsSelected { get; set; }

    // Navigation properties
    public virtual Tender Tender { get; set; } = null!;
    public virtual Company Company { get; set; } = null!;
    public virtual Currency? Currency { get; set; }
    public virtual Document? Document { get; set; }
    public virtual ICollection<TenderQuotationLineItem> TenderQuotationLineItems { get; set; } = new List<TenderQuotationLineItem>();
}
