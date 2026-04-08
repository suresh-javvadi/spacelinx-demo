namespace SpaceLinx.Model
{
    public partial class BankAccount : BaseModel
    {
        public string BankName { get; set; } = null!;
        public string BranchName { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string? SwiftCode { get; set; }
        public Guid? CurrencyId { get; set; }
        public string? IfscCode { get; set; }
        public Guid? AddressId { get; set; }
        public virtual Address Address { get; set; } = null!;
        public virtual Currency? Currency { get; set; }
        public virtual ICollection<CompanyBankAccount> CompanyBankAccounts { get; set; } = new List<CompanyBankAccount>();
    }
}