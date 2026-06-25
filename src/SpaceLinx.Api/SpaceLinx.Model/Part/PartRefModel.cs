namespace SpaceLinx.Model
{
    public partial class PartRefModel : BaseRefModel
    {
        public string Name { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public double Weight { get; set; }
        public string? PartNumberSuffix { get; set; }
        public string Version { get; set; } = null!;
        public string? PartNumber { get; set; }
        public string? Status { get; set; }
        public int MakeBuy { get; set; }
        public bool IsSerialNumberRequired { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? ManufacturingPartNumber { get; set; }
        public string? ManufacturerName { get; set; }
        public int? Trl { get; set; }
        public bool? SpaceQualified { get; set; }
        public string? ItemType { get; set; }
        public string? ReferenceNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool HasBom { get; set; }
        public string? Material { get; set; }
        public string? Grade { get; set; }
        public string? Specification { get; set; }
        public string? Package { get; set; }
        public string? Qualification { get; set; }
        public string? HsnCode { get; set; }
        public string? RadiationTolerance { get; set; }
        public string? TempRange { get; set; }
        public string? TempCoefficient { get; set; }
        public virtual PartTypeRefModel PartType { get; set; } = null!;
        public virtual CountryRefModel? CountryOfOrigin { get; set; }
        public virtual SubsystemRefModel? Subsystem { get; set; }
    }
}