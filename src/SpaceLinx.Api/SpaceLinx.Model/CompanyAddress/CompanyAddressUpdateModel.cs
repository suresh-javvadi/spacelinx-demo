namespace SpaceLinx.Model
{
    public partial class CompanyAddressUpdateModel : BaseUpdateModel
    {
        public Guid CompanyId { get; set; }
        public Guid AddressId { get; set; }
        public string? AddressType { get; set; }
    }
}