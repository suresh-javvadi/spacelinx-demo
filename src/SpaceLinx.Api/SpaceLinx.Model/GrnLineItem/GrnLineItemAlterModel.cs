namespace SpaceLinx.Model;

public partial class GrnLineItemAlterModel
{
    public Guid? Id { get; set; }
    public Guid PartId { get; set; }
    public int? ReceivedQuantity { get; set; }
    public string? Remark { get; set; }
}