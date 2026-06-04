namespace SpaceLinx.Model;

public partial class TenderQuotationLineItem : BaseModel
{
    public Guid TenderQuotationId { get; set; }
    public Guid? TenderLineItemId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
    public int? LeadTimeDays { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public virtual TenderQuotation TenderQuotation { get; set; } = null!;
    public virtual TenderLineItem TenderLineItem { get; set; } = null!;
}
