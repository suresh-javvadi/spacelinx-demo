namespace SpaceLinx.Model;

public partial class TenderQuotationReadModel : BaseReadModel
{
    public Guid TenderId { get; set; }
    public Guid CompanyId { get; set; }
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

    public virtual CompanyRefModel Company { get; set; } = null!;
    public virtual CurrencyRefModel? Currency { get; set; }
    public virtual ICollection<TenderQuotationLineItemReadModel> LineItems { get; set; } = new List<TenderQuotationLineItemReadModel>();
}
