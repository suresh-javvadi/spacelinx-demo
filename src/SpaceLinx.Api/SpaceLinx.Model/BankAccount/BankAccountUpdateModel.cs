namespace SpaceLinx.Model
{
    public partial class BankAccountUpdateModel : BaseUpdateModel
    {
        public string BankName { get; set; } = null!;
        public string BranchName { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string? SwiftCode { get; set; }
        public Guid? CurrencyId { get; set; }
        public string? IfscCode { get; set; }
        public Guid? AddressId { get; set; }
    }
}