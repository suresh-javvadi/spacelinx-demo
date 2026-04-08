namespace SpaceLinx.Model;

public partial class TenderQuotationLineItemRefModel : BaseRefModel
{
    public Guid TenderQuotationId { get; set; }
    public Guid TenderLineItemId { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal TotalPrice { get; set; }
}
