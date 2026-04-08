namespace SpaceLinx.Model
{
    public partial class ContactDetailWriteModel : BaseWriteModel
    {
        public string ContactType { get; set; } = null!;
        public ContactWriteModel Contact { get; set; } = null!;
    }
}
