namespace SpaceLinx.Model;

public partial class PartsNotAssociatedWithGuide
{
    public Guid? Id { get; set; }
    public string? PartNumber { get; set; }
    public string? Name { get; set; }
    public string? ShortDescription { get; set; }
    public string? Description { get; set; }
    public Guid? PartTypeId { get; set; }
    public Guid? UnitOfMeasureId { get; set; }
    public int? MakeBuy { get; set; }
    public bool? IsSerialNumberRequired { get; set; }
    public string? Status { get; set; }
    public string? ReferenceNumber { get; set; }
    public bool? IsActive { get; set; }
    public DateTime? CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
