namespace SpaceLinx.Model
{
    public partial class OrganizationCreateModel 
    {
        public string Name { get; set; } = null!;
        public string? Category { get; set; }
        public string? Description { get; set; }
        public string TaxNumber { get; set; } = null!;
    }
}