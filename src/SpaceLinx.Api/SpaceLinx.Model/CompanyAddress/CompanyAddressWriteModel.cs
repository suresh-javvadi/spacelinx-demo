namespace SpaceLinx.Model
{
    public partial class CompanyAddressWriteModel : BaseWriteModel
    {
        public Guid CompanyId { get; set; }
        public Guid AddressId { get; set; }
        public string? AddressType { get; set; }
    }
}