namespace SpaceLinx.Model;

public partial class GrnLineItemQcAlterModel
{
    public Guid? Id { get; set; }
    public string? QcStatus { get; set; }
    public DateOnly? ManufacturingDate { get; set; }
    public DateOnly? ExpiryDate { get; set; }
    public string? QcRemark { get; set; }
}