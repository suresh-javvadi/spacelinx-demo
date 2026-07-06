namespace SpaceLinx.Model
{
    public partial class PartWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public Guid PartTypeId { get; set; }
        public double Weight { get; set; }
        public Guid? UnitOfMeasureId { get; set; }
        public int MakeBuy { get; set; }
        public bool IsSerialNumberRequired { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? ManufacturingPartNumber { get; set; }
        public string? ManufacturerName { get; set; }
        public int? Trl { get; set; }
        public bool? SpaceQualified { get; set; }
        public string? ItemType { get; set; }
        public string? ReferenceNumber { get; set; }
        public string? Material { get; set; }
        public string? Grade { get; set; }
        public Guid? CountryOfOriginId { get; set; }
        public Guid? SubsystemId { get; set; }
        public string? Specification { get; set; }
        public string? Package { get; set; }
        public string? Qualification { get; set; }
        public string? RadiationTolerance { get; set; }
        public string? TempRange { get; set; }
        public string? TempCoefficient { get; set; }
    }
}