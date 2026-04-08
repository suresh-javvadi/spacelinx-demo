namespace SpaceLinx.Model
{
    public partial class AddressDetailUpdateModel : BaseUpdateModel
    {
        public string AddressType { get; set; } = null!;
        public AddressUpdateModel Address { get; set; } = null!;
    }
}