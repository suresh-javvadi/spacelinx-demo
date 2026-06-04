namespace SpaceLinx.Model;

public partial class TenderLineItem : BaseModel
{
    public Guid TenderId { get; set; }
    public Guid? PartId { get; set; }
    public int Quantity { get; set; }
    public Guid? UnitOfMeasureId { get; set; }
    public string? Description { get; set; }
    public string? Specifications { get; set; }
    public int? LineNumber { get; set; }

    // Navigation properties
    public virtual Tender Tender { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
    public virtual UnitOfMeasure? UnitOfMeasure { get; set; }
    public virtual ICollection<TenderQuotationLineItem> TenderQuotationLineItems { get; set; } = new List<TenderQuotationLineItem>();
}
