namespace SpaceLinx.Model
{
    public partial class CompanyWithOrganizationVw
    {
        public Guid? Id { get; set; }
        public string? Name { get; set; }
        public bool? IsActive { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
        public string? EntityType { get; set; }
    }
}