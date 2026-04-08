namespace SpaceLinx.Model
{
    public class ConsolidatedBomItem
    {
        public Guid Id { get; set; }
        public string? PartNumberSuffix { get; set; }
        public string? PartNumber { get; set; }
        public string Name { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public int TotalQuantity { get; set; }
        public Guid PartTypeId { get; set; }
        public string PartTypeName { get; set; } = null!;
        public string? PartTypeCategory { get; set; }
        public string? Status { get; set; }
        public int MakeBuy { get; set; }
        public bool IsSerialNumberRequired { get; set; }
        public string? ManufacturingPartNumber { get; set; }
        public string? ManufacturerName { get; set; }
        public int? Trl { get; set; }
        public bool? SpaceQualified { get; set; }
        public string? ReferenceNumber { get; set; }
        public double Weight { get; set; }
        public string? Material { get; set; }
        public string? Grade { get; set; }
        public Guid? CountryOfOriginId { get; set; }
        public string? CountryOfOriginName { get; set; }
        public Guid? AssemblyLocationId { get; set; }
        public string? AssemblyLocationName { get; set; }
        public string? SubsystemName { get; set; }
        public string? PartLevelName { get; set; }
    }
}
