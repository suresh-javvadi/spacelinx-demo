namespace SpaceLinx.Model
{
    public partial class ContactUpdateModel : BaseUpdateModel
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? PhoneNumber { get; set; }
        public string? AlternatePhone { get; set; }
        public string? JobTitle { get; set; }
        public string? Notes { get; set; }
        public bool? IsPrimary { get; set; }
    }
}