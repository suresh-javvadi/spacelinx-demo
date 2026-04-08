namespace SpaceLinx.Model;

public partial class PurchaseOrderRefModel : BaseRefModel
{
    public string Number { get; set; } = null!;
    public Guid CompanyId { get; set; }
    public Guid? ProjectId { get; set; }
    public string? PoType { get; set; }
    public Guid? BuyerId { get; set; }
    public Guid? SupplyChainLeadId { get; set; }
    public Guid? RequisitionId { get; set; }
    public Guid? PaymentTermId { get; set; }
    public Guid? CurrencyId { get; set; }
    public DateOnly OrderDate { get; set; }
    public DateOnly? ActualDeliveryDate { get; set; }
    public DateOnly? ExpectedDeliveryDate { get; set; }
    public decimal? Discount { get; set; }
    public string? DiscountType { get; set; }
    public string? TaxOption { get; set; }
    public decimal TotalAmount { get; set; }
    public string Status { get; set; } = null!;
    public string? RevisionHistory { get; set; }
    public Guid BillingAddressId { get; set; }
    public Guid? DeliveryAddressId { get; set; }
    public Guid? ShippingAddressId { get; set; }
    public string DeliveryStatus { get; set; } = null!;
    public Guid? QuotationReferenceId { get; set; }
    public string? PoTerms { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedDate { get; set; }
}