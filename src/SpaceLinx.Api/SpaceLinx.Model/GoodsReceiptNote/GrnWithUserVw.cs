namespace SpaceLinx.Model
{
    public partial class GrnWithUserVw
    {
        public Guid? GrnId { get; set; }
        public string? GrnNumber { get; set; }
        public Guid? PurchaseOrderId { get; set; }
        public DateOnly? ReceivedDate { get; set; }
        public Guid? ReceivedById { get; set; }
        public Guid? LocationId { get; set; }
        public string? ReceivedByFullName { get; set; }
        public string? ReceivedByEmail { get; set; }
        public string? Description { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? InvoiceNumber { get; set; }
        public DateOnly? InvoiceDate { get; set; }
        public Guid? VendorReferenceId { get; set; }
        public string? Status { get; set; }
        public Guid? VendorId { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public Guid? PoId { get; set; }
        public string? PoNumber { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? BuyerId { get; set; }
        public Guid? SupplyChainLeadId { get; set; }
        public Guid? RequisitionId { get; set; }
        public Guid? PaymentTermId { get; set; }
        public Guid? CurrencyId { get; set; }
        public DateOnly? OrderDate { get; set; }
        public DateOnly? DeliveryDate { get; set; }
        public DateOnly? ExpectedDeliveryDate { get; set; }
        public string? PaymentTermName { get; set; }
        public int? PaymentTermDueDays { get; set; }
        public DateOnly? ExpectedPaymentDate { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? PoStatus { get; set; }
        public string? RevisionHistory { get; set; }
        public Guid? BillingAddressId { get; set; }
        public Guid? DeliveryAddressId { get; set; }
        public Guid? ShippingAddressId { get; set; }
        public string? DeliveryStatus { get; set; }
        public Guid? QuotationReferenceId { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? LocationNumber { get; set; }
        public string? LocationName { get; set; }
        public string? VendorCode { get; set; }
        public string? VendorName { get; set; }
    }
}