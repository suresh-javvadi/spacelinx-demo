namespace SpaceLinx.Model
{
    public partial class CompanyBankAccount : BaseModel
    {
        public Guid CompanyId { get; set; }
        public Guid BankAccountId { get; set; }
        public virtual BankAccount BankAccount { get; set; } = null!;
        public virtual Company Company { get; set; } = null!;
    }
}