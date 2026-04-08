namespace SpaceLinx.Model;

public partial class ScrapLineItemReadModel : BaseReadModel
{
    public Guid ScrapRequestId { get; set; }
    public Guid PartId { get; set; }
    public string? TrackingType { get; set; }
    public string? TrackingId { get; set; }
    public int ScrapQuantity { get; set; }
    public string? Reason { get; set; }
    public virtual Part Part { get; set; } = null!;
    public virtual ScrapRequest ScrapRequest { get; set; } = null!;
}