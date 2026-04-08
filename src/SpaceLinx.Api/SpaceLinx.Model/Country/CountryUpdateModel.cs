namespace SpaceLinx.Model
{
    public partial class CountryUpdateModel : BaseUpdateModel
    {
        public string Name { get; set; } = null!;
        public string Iso2Code { get; set; } = null!;
        public string Iso3Code { get; set; } = null!;
        public int? NumericCode { get; set; }
    }
}