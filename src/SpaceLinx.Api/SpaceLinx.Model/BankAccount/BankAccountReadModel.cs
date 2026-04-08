namespace SpaceLinx.Model
{
    public partial class BankAccountReadModel : BaseReadModel
    {
        public string BankName { get; set; } = null!;
        public string BranchName { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string? SwiftCode { get; set; }
        public Guid? CurrencyId { get; set; }
        public string? IfscCode { get; set; }
        public Guid? AddressId { get; set; }
        public virtual AddressRefModel Address { get; set; } = null!;
        public virtual CurrencyRefModel? Currency { get; set; }
    }
}