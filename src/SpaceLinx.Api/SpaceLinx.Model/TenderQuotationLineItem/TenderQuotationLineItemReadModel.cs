namespace SpaceLinx.Model;

public partial class TenderQuotationLineItemReadModel : BaseReadModel
{
    public Guid TenderQuotationId { get; set; }
    public Guid TenderLineItemId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public int? LeadTimeDays { get; set; }
    public string? Notes { get; set; }

    public virtual TenderLineItemRefModel TenderLineItem { get; set; } = null!;
}
