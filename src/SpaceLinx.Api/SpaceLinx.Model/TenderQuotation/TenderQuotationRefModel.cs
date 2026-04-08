namespace SpaceLinx.Model;

public partial class TenderQuotationRefModel : BaseRefModel
{
    public Guid TenderId { get; set; }
    public Guid CompanyId { get; set; }
    public string? QuotationNumber { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsSelected { get; set; }
}
