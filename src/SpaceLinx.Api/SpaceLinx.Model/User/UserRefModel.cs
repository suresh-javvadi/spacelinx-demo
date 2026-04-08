namespace SpaceLinx.Model
{
    public partial class UserRefModel : BaseRefModel
    {
        public string FirstName { get; set; } = null!;
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
    }
}