namespace SpaceLinx.Model
{
    public partial class Currency : BaseModel
    {
        public string Code { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Symbol { get; set; }
        public string? Country { get; set; }
        public int? MinorUnit { get; set; }
        public virtual ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
        public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
        public virtual ICollection<Company> Companies { get; set; } = new List<Company>();
        public virtual ICollection<PoLineItem> PoLineItems { get; set; } = new List<PoLineItem>();
    }
}