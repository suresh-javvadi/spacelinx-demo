namespace SpaceLinx.Model
{
    public partial class OrganizationAddressReadModel : BaseReadModel
    {
        public Guid OrganizationId { get; set; }
        public Guid AddressId { get; set; }
        public string AddressType { get; set; } = null!;
        public virtual AddressRefModel Address { get; set; } = null!;
        public virtual OrganizationRefModel Organization { get; set; } = null!;
    }
}
