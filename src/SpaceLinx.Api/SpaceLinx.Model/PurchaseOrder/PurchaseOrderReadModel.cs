namespace SpaceLinx.Model;

public partial class PurchaseOrderReadModel : BaseReadModel
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
    public string? QuotationReferenceNumber { get; set; }
    public string? ShipmentReferenceNumber { get; set; }
    public string Status { get; set; } = null!;
    public string? RevisionHistory { get; set; }
    public decimal? RoundOff { get; set; }
    public Guid BillingAddressId { get; set; }
    public Guid? DeliveryAddressId { get; set; }
    public Guid? ShippingAddressId { get; set; }
    public Guid? VendorBillingAddressId { get; set; }
    public Guid? VendorBillingContactId { get; set; }
    public string DeliveryStatus { get; set; } = null!;
    public Guid? QuotationReferenceId { get; set; }
    public string? PoTerms { get; set; }
    public string? Description { get; set; }
    public string? CustomerInstructions { get; set; }
    public string? DeliveryTerms { get; set; }
    public string? TermsAndConditions { get; set; }
    public string? ApprovedBy { get; set; }
    public DateTime? ApprovedDate { get; set; }
    public string? RejectedBy { get; set; }
    public DateTime? RejectedDate { get; set; }
    public virtual AddressRefModel BillingAddress { get; set; } = null!;
    public virtual UserRefModel? Buyer { get; set; }
    public virtual CurrencyRefModel? Currency { get; set; }
    public virtual AddressRefModel DeliveryAddress { get; set; } = null!;
    public virtual PaymentTermRefModel? PaymentTerm { get; set; }
    public virtual ProjectRefModel? Project { get; set; }
    public virtual RequisitionRefModel? Requisition { get; set; }
    public virtual AddressRefModel ShippingAddress { get; set; } = null!;
    public virtual UserRefModel? SupplyChainLead { get; set; }
    public virtual CompanyRefModel Company { get; set; } = null!;
    public virtual DocumentRefModel? QuotationReference { get; set; }
}