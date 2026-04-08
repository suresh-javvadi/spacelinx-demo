namespace SpaceLinx.Model
{
    public partial class CurrencyUpdateModel : BaseUpdateModel
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Symbol { get; set; }
        public string? Country { get; set; }
        public int? MinorUnit { get; set; }
    }
}