namespace SpaceLinx.Model
{
    public partial class Country : BaseModel
    {
        public string Name { get; set; } = null!;
        public string Iso2Code { get; set; } = null!;
        public string Iso3Code { get; set; } = null!;
        public int? NumericCode { get; set; }
    }
}