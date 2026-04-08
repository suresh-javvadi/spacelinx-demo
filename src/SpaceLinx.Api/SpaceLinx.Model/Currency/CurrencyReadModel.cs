namespace SpaceLinx.Model
{
    public partial class CurrencyReadModel : BaseReadModel
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Symbol { get; set; }
        public string? Country { get; set; }
        public int? MinorUnit { get; set; }
    }
}