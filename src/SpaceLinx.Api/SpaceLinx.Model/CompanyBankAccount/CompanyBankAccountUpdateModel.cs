namespace SpaceLinx.Model
{
    public partial class CompanyBankAccountUpdateModel : BaseUpdateModel
    {
        public Guid CompanyId { get; set; }
        public Guid BankAccountId { get; set; }
    }
}