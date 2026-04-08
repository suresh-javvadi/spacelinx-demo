namespace SpaceLinx.Model;

public partial class GuideMbomVw
{
    public Guid? GuideId { get; set; }
    public Guid? GuidePartId { get; set; }
    public string? GuidePartNumber { get; set; }
    public string? GuidePartName { get; set; }
    public string? GuidePartNumberSuffix { get; set; }
    public Guid? EbomId { get; set; }
    public Guid? EbomPartId { get; set; }
    public string? Name { get; set; }
    public string? PartNumber { get; set; }
    public string? PartNumberSuffix { get; set; }
    public bool? IsSerialNumberRequired { get; set; }
    public int? QuantityE { get; set; }
    public Guid? GsePartId { get; set; }
    public double? GuideMbomWeight { get; set; }
    public long? QuantityM { get; set; }
    public double? ChildPartWeight { get; set; }
}