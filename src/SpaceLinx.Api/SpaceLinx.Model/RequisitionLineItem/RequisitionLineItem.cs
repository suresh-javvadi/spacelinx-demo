namespace SpaceLinx.Model;
 
public partial class RequisitionLineItem : BaseModel
{
    public Guid RequisitionId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
    public virtual Part Part { get; set; } = null!; 
    public virtual Requisition Requisition { get; set; } = null!;
}