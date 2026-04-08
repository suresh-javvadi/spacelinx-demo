namespace SpaceLinx.Model
{
    public partial class OrganizationAddress : BaseModel
    {
        public Guid OrganizationId { get; set; }
        public Guid AddressId { get; set; }
        public string AddressType { get; set; } = null!;
        public virtual Address Address { get; set; } = null!;
        public virtual Organization Organization { get; set; } = null!;
    }
}
