namespace SpaceLinx.Model
{
    public partial class CompanyAddressReadModel : BaseReadModel
    {
        public Guid CompanyId { get; set; }
        public Guid AddressId { get; set; }
        public string? AddressType { get; set; }
        public virtual AddressRefModel Address { get; set; } = null!;
        public virtual CompanyRefModel Company { get; set; } = null!;
    }
}