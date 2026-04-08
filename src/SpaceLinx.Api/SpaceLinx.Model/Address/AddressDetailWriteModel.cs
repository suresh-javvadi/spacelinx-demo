namespace SpaceLinx.Model
{
    public partial class AddressDetailWriteModel : BaseWriteModel
    {
        public string AddressType { get; set; } = null!;
        public AddressWriteModel Address { get; set; } = null!;
    }
}
