namespace SpaceLinx.Model
{
    public partial class StaffUpdateModel : BaseUpdateModel
    {
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid? ManagerId { get; set; }
        public string? StaffNumber { get; set; }
        public string? JobTitle { get; set; }
        public DateOnly? EmploymentStartDate { get; set; }
        public DateOnly? EmploymentEndDate { get; set; }
        public string? ImageUrl { get; set; }
    }
}