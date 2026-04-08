namespace SpaceLinx.Model;

public partial class PoLineItemAlterModel
{
    public Guid? Id { get; set; }
    public Guid? PartId { get; set; }
    public int OrderedQuantity { get; set; }
    public int? ReceivedQuantity { get; set; }
    public int? PendingQuantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
    public decimal? ConversionRate { get; set; }
    public string? Currency { get; set; }
    public decimal? Tax { get; set; }
    public string? TaxType { get; set; }
    public string? Description { get; set; }
    public string? Hsn { get; set; }
    public decimal? Discount { get; set; }
    public string? DiscountType { get; set; }
    public DateOnly? ActualDeliveryDate { get; set; }
    public DateOnly? ExpectedDeliveryDate { get; set; }
}