namespace SpaceLinx.Model
{
    public partial class CustomerReadModel : BaseReadModel
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? TaxNumber { get; set; }
        public string? Category { get; set; }
        public Guid? CustomerAddressId { get; set; }
        public string? ImageUrl { get; set; }
        public virtual AddressRefModel? CustomerAddress { get; set; }
    }
}