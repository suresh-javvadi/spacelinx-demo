namespace SpaceLinx.Model
{
    public partial class Customer : BaseModel  
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? TaxNumber { get; set; }
        public string? Category { get; set; }
        public Guid? CustomerAddressId { get; set; }
        public string? ImageUrl { get; set; }
        public virtual Address? CustomerAddress { get; set; }
        public virtual ICollection<Program> Programs { get; set; } = new List<Program>();
    }
}