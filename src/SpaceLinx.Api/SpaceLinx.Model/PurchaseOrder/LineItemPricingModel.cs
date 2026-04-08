namespace SpaceLinx.Model;

public class LineItemPricingModel
{
    public Guid PartId { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? Tax { get; set; }
    public string? TaxType { get; set; }
    public string? Hsn { get; set; }
    public decimal? Discount { get; set; }
    public string? DiscountType { get; set; }
}
