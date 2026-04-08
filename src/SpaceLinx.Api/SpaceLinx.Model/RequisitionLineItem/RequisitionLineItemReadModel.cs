namespace SpaceLinx.Model;
 
public partial class RequisitionLineItemReadModel : BaseReadModel
{
    public Guid RequisitionId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public virtual PartRefModel Part { get; set; } = null!; 
    public virtual RequisitionRefModel Requisition { get; set; } = null!;
}