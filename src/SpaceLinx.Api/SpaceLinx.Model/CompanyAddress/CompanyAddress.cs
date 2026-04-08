namespace SpaceLinx.Model
{
    public partial class CompanyAddress : BaseModel
    {
        public Guid CompanyId { get; set; }
        public Guid AddressId { get; set; }
        public string? AddressType { get; set; }
        public virtual Address Address { get; set; } = null!;
        public virtual Company Company { get; set; } = null!;
    }
}