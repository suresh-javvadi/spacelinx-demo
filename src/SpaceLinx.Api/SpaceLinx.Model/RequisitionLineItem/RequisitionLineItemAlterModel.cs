namespace SpaceLinx.Model;

public partial class RequisitionLineItemAlterModel
{
    public Guid? Id { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public string? Description { get; set; }
}