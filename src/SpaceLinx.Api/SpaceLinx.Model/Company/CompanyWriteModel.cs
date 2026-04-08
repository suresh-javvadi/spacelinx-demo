namespace SpaceLinx.Model
{
    public partial class CompanyWriteModel : BaseWriteModel
    {
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
    }
}