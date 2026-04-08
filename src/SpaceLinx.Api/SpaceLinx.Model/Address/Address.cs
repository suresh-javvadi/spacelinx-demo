namespace SpaceLinx.Model
{
    public partial class Address : BaseModel
    {
        public string AddressLine1 { get; set; } = null!;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string? PostalCode { get; set; }
        public Guid CountryId { get; set; }
        public string? PhoneNumber { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public virtual ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
        public virtual Country Country { get; set; } = null!;
        public virtual ICollection<CompanyAddress> CompanyAddresses { get; set; } = new List<CompanyAddress>();
        public virtual ICollection<Customer> Customers { get; set; } = new List<Customer>();
        public virtual ICollection<OrganizationAddress> OrganizationAddresses { get; set; } = new List<OrganizationAddress>();
        public virtual ICollection<PurchaseOrder> PurchaseOrderBillingAddresses { get; set; } = new List<PurchaseOrder>();
        public virtual ICollection<PurchaseOrder> PurchaseOrderDeliveryAddresses { get; set; } = new List<PurchaseOrder>();
        public virtual ICollection<PurchaseOrder> PurchaseOrderShippingAddresses { get; set; } = new List<PurchaseOrder>();
        public virtual ICollection<PurchaseOrder> PurchaseOrderVendorBillingAddresses { get; set; } = new List<PurchaseOrder>();
    }
}