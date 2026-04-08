namespace SpaceLinx.Model
{
    public partial class PaymentTerm : BaseModel
    {
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int DueDays { get; set; }
        public int? DiscountDays { get; set; }
        public decimal? DiscountPercent { get; set; }
        public string? PaymentTerms { get; set; }
        public string PaymentTermType { get; set; } = null!;
        public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
        public virtual ICollection<Company> Companies { get; set; } = new List<Company>();
    }
}