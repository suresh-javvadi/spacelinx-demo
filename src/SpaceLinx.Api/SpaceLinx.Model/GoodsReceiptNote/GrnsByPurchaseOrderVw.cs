namespace SpaceLinx.Model
{
    public partial class GrnsByPurchaseOrderVw
    {
        public Guid? GrnId { get; set; }
        public string? GrnNumber { get; set; }
        public Guid? PurchaseOrderId { get; set; }
        public DateOnly? ReceivedDate { get; set; }
        public Guid? ReceivedById { get; set; }
        public string? ReceivedByFullName { get; set; }
        public string? ReceivedByEmail { get; set; }
        public Guid? LocationId { get; set; }
        public string? LocationNumber { get; set; }
        public string? LocationName { get; set; }
        public string? Description { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? InvoiceNumber { get; set; }
        public DateOnly? InvoiceDate { get; set; }
        public Guid? VendorReferenceId { get; set; }
        public string? Status { get; set; }
        public Guid? VendorId { get; set; }
        public string? VendorCode { get; set; }
        public string? VendorName { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public string? GrnLineItems { get; set; }
    }
}