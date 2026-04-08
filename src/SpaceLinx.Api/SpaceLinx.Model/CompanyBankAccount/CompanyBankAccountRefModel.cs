namespace SpaceLinx.Model
{
    public partial class CompanyBankAccountRefModel : BaseRefModel
    {
        public Guid CompanyId { get; set; }
        public Guid BankAccountId { get; set; }
    }
}