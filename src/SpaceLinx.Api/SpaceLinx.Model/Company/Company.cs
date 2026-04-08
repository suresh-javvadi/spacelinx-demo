namespace SpaceLinx.Model
{
    public partial class Company : BaseModel
    {
        public string? CompanyCode { get; set; }
        public string? VendorCode { get; set; }
        public string? CustomerCode { get; set; }
        public string? PartnerCode { get; set; }
        public string Name { get; set; } = null!;
        public string? ContactName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AlternatePhone { get; set; }
        public string? Website { get; set; }
        public string? TaxId { get; set; }
        public string? CurrencyCode { get; set; }
        public int? QualityScore { get; set; }
        public string? Category { get; set; }
        public string? Department { get; set; }
        public Guid? PaymentTermId { get; set; }
        public Guid? CurrencyId { get; set; }
        public string? LogoUrl { get; set; }
        public string? Notes { get; set; }
        public int? TotalOrders { get; set; }
        public double? TotalSpent { get; set; }
        public double? AvgOrderValue { get; set; }
        public double? OnTimeDeliveryRate { get; set; }
        public DateTime? MemberSince { get; set; }
        public DateTime? LastActivityDate { get; set; }
        public string? Email { get; set; }
        public bool? IsVendor { get; set; }
        public bool? IsCustomer { get; set; }
        public bool? IsPartner { get; set; }
        public string? PanNumber { get; set; }
        public virtual PaymentTerm? PaymentTerm { get; set; }
        public virtual Currency? Currency { get; set; }
        public virtual ICollection<CompanyAddress> CompanyAddresses { get; set; } = new List<CompanyAddress>();
        public virtual ICollection<CompanyBankAccount> CompanyBankAccounts { get; set; } = new List<CompanyBankAccount>();
        public virtual ICollection<CompanyContact> CompanyContacts { get; set; } = new List<CompanyContact>();
        public virtual ICollection<CompanyPart> CompanyParts { get; set; } = new List<CompanyPart>();
        public virtual ICollection<Contact> Contacts { get; set; } = new List<Contact>();
        public virtual ICollection<GoodsReceiptNote> GoodsReceiptNotes { get; set; } = new List<GoodsReceiptNote>();
        public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
        public virtual ICollection<VendorReturnRequest> VendorReturnRequests { get; set; } = new List<VendorReturnRequest>();
    }
}