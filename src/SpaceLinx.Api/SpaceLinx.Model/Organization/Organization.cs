namespace SpaceLinx.Model
{
    public partial class Organization : BaseModel
    {
        public string Name { get; set; } = null!;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string TaxNumber { get; set; } = null!;
        public virtual ICollection<OrganizationAddress> OrganizationAddresses { get; set; } = new List<OrganizationAddress>();
        public virtual ICollection<Staff> Staff { get; set; } = new List<Staff>();
    }
}
