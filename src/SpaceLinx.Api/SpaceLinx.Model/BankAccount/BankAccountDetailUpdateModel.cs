namespace SpaceLinx.Model
{
    public partial class BankAccountDetailUpdateModel : BaseUpdateModel
    {
        public BankAccountUpdateModel BankAccount { get; set; } = null!;
    }
}