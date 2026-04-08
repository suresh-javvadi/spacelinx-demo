namespace SpaceLinx.Model;

public partial class TenderLineItemReadModel : BaseReadModel
{
    public Guid TenderId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public Guid? UnitOfMeasureId { get; set; }
    public string? Description { get; set; }
    public string? Specifications { get; set; }
    public int? LineNumber { get; set; }

    public virtual PartRefModel Part { get; set; } = null!;
    public virtual UnitOfMeasureRefModel? UnitOfMeasure { get; set; }
}
