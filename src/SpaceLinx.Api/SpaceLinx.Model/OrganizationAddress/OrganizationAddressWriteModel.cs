namespace SpaceLinx.Model
{
    public partial class OrganizationAddressWriteModel : BaseWriteModel
    {
        public Guid OrganizationId { get; set; }
        public Guid AddressId { get; set; }
        public string AddressType { get; set; } = null!;
    }
}
