namespace SpaceLinx.Model
{
    public partial class CompanyBankAccountWriteModel : BaseWriteModel
    {
        public Guid CompanyId { get; set; }
        public Guid BankAccountId { get; set; }
    }
}