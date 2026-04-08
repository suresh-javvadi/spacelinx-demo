namespace SpaceLinx.Model;
 
public partial class RequisitionLineItemWriteModel : BaseWriteModel
{
    public Guid RequisitionId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
}