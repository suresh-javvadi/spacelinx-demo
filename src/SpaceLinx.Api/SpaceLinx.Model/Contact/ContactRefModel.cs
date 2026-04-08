namespace SpaceLinx.Model
{
    public partial class ContactRefModel : BaseRefModel
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? AlternatePhone { get; set; }
        public Guid? CompanyId { get; set; }
        public string? JobTitle { get; set; }
        public string? Notes { get; set; }
        public bool? IsPrimary { get; set; }
    }
}