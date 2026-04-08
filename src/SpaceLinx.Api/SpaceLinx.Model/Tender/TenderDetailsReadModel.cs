namespace SpaceLinx.Model;

public partial class TenderDetailsReadModel : TenderReadModel
{
    public virtual ICollection<TenderLineItemReadModel> TenderLineItems { get; set; } = new List<TenderLineItemReadModel>();
    public virtual ICollection<TenderVendorReadModel> TenderVendors { get; set; } = new List<TenderVendorReadModel>();
    public virtual ICollection<TenderQuotationReadModel> TenderQuotations { get; set; } = new List<TenderQuotationReadModel>();
}
