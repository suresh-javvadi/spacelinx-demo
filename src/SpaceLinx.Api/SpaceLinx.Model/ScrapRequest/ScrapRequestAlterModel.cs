namespace SpaceLinx.Model;

public class ScrapRequestAlterModel
{
    public Guid? LocationId { get; set; }
    public Guid? RaisedById { get; set; }
    public Guid? ApprovedById { get; set; }
    public Guid? PoId { get; set; }
    public Guid? GrnId { get; set; }
    public Guid? WoId { get; set; }
    public DateOnly? ScrapDate { get; set; }
    public string? Reason { get; set; }
    public string? Status { get; set; }
    public List<ScrapLineItemAlterModel>? ScrapLineItems { get; set; }
    public List<DocumentCreateModel>? DocumentFiles { get; set; }
}