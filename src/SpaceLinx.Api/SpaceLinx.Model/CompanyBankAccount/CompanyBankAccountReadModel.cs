namespace SpaceLinx.Model
{
    public partial class CompanyBankAccountReadModel : BaseReadModel
    {
        public Guid CompanyId { get; set; }
        public Guid BankAccountId { get; set; }
        public virtual BankAccountRefModel BankAccount { get; set; } = null!;
        public virtual CompanyRefModel Company { get; set; } = null!;
    }
}