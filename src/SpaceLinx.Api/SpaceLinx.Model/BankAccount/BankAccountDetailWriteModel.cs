namespace SpaceLinx.Model
{
    public partial class BankAccountDetailWriteModel : BaseWriteModel
    {
        public BankAccountWriteModel BankAccount { get; set; } = null!;
    }
}
