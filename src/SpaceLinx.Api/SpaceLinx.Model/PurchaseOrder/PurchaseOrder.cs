namespace SpaceLinx.Model;

public partial class PurchaseOrder : BaseModel
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
    public virtual Address BillingAddress { get; set; } = null!;
    public virtual User? Buyer { get; set; }
    public virtual Currency? Currency { get; set; }
    public virtual Address DeliveryAddress { get; set; } = null!;
    public virtual ICollection<GoodsReceiptNote> GoodsReceiptNotes { get; set; } = new List<GoodsReceiptNote>();
    public virtual PaymentTerm? PaymentTerm { get; set; }
    public virtual ICollection<PoLineItem> PoLineItems { get; set; } = new List<PoLineItem>();
    public virtual Project? Project { get; set; }
    public virtual Requisition? Requisition { get; set; }
    public virtual ICollection<ScrapRequest> ScrapRequests { get; set; } = new List<ScrapRequest>();
    public virtual Address ShippingAddress { get; set; } = null!;
    public virtual Address? VendorBillingAddress { get; set; }
    public virtual Contact? VendorBillingContact { get; set; }
    public virtual User? SupplyChainLead { get; set; }
    public virtual Company Company { get; set; } = null!;
    public virtual Document? QuotationReference { get; set; }
    public virtual ICollection<VendorReturnRequest> VendorReturnRequests { get; set; } = new List<VendorReturnRequest>();
}