namespace SpaceLinx.Model;

public partial class GrnLineItemDetailReadModel : BaseReadModel
{
    public Guid GrnId { get; set; }
    public Guid PartId { get; set; }
    public int? OrderedQuantity { get; set; }
    public int? ReceivedQuantity { get; set; }
    public string? TrackingMethod { get; set; }
    public string? TrackingId { get; set; }
    public DateOnly? ManufacturingDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public string? QcStatus { get; set; }
    public DateTime? QcDate { get; set; }
    public Guid? CheckedById { get; set; }
    public string? Remark { get; set; }
    public string? Disposition { get; set; }
    public string? QcRemark { get; set; }
    public virtual PartRefModel Part { get; set; } = null!;
}