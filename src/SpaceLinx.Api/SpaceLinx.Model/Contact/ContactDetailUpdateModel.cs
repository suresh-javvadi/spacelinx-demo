namespace SpaceLinx.Model
{
    public partial class ContactDetailUpdateModel : BaseUpdateModel
    {
        public string ContactType { get; set; } = null!;
        public ContactUpdateModel Contact { get; set; } = null!;
    }
}