namespace SpaceLinx.Model
{
    public class ProductImageWriteModel
    {
        public string Name { get; set; } = null!;
        public Guid? PlatformId { get; set; }
        public Guid PartId { get; set; }
        public string? Description { get; set; }
    }
}
