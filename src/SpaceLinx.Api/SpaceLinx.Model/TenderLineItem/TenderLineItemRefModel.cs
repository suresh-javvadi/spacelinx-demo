namespace SpaceLinx.Model;

public partial class TenderLineItemRefModel : BaseRefModel
{
    public Guid TenderId { get; set; }
    public Guid PartId { get; set; }
    public int Quantity { get; set; }
    public int? LineNumber { get; set; }
}
