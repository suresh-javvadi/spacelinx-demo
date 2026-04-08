namespace SpaceLinx.Model
{
    public class PartDocumentReadModel : DocumentReadModel
    {
        public Guid PartId { get; set; }
        public string? PartNumber { get; set; }
        public string? PartName { get; set; }
        public string? PartNumberSuffix { get; set; }
    }
}
