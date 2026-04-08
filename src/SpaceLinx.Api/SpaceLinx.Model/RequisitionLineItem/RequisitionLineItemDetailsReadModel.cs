namespace SpaceLinx.Model;

public partial class RequisitionLineItemDetailsReadModel : BaseReadModel
{
    public Guid RequisitionId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public PartRefModel? Part { get; set; }
}