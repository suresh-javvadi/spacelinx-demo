namespace SpaceLinx.Model
{
    public partial class AddressReadModel : BaseReadModel
    {
        public string AddressLine1 { get; set; } = null!;
        public string? AddressLine2 { get; set; }
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string? PostalCode { get; set; }
        public Guid CountryId { get; set; }
        public string? PhoneNumber { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public virtual CountryRefModel Country { get; set; } = null!;
    }
}