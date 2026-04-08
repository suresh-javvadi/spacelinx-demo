namespace SpaceLinx.Model
{
    public partial class PaymentTermRefModel : BaseRefModel
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DueDays { get; set; }
        public int? DiscountDays { get; set; }
        public decimal? DiscountPercent { get; set; }
        public string? PaymentTerms { get; set; }
        public string PaymentTermType { get; set; } = null!;
    }
}