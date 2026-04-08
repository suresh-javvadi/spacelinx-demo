namespace SpaceLinx.Model
{
    public partial class PurchaseOrdersVw
    {
        public Guid? Id { get; set; }
        public string? Number { get; set; }
        public string? VendorName { get; set; }
        public string? VendorCode { get; set; }
        public string? VendorContact { get; set; }
        public string? VendorPhone { get; set; }
        public DateOnly? OrderDate { get; set; }
        public DateOnly? DeliveryDate { get; set; }
        public string? Status { get; set; }
        public decimal? TotalAmount { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? PaymentTerm { get; set; }
        public string? ProjectCode { get; set; }
        public string? ProjectName { get; set; }
        public string? BillingCity { get; set; }
        public string? ShippingCity { get; set; }
        public string? RequisitionNumber { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? Description { get; set; }
        public string? CustomerInstructions { get; set; }
        public string? DeliveryTerms { get; set; }
        public string? TermsAndConditions { get; set; }
    }
}