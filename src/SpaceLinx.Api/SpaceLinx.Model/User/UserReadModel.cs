namespace SpaceLinx.Model
{
    public partial class UserReadModel : BaseReadModel
    {
        public int UserNumber { get; set; }
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
    }
}
