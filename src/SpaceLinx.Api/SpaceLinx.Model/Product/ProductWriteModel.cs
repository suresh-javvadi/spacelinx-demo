namespace SpaceLinx.Model
{
    public partial class ProductWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public Guid? PlatformId { get; set; }
        public Guid PartId { get; set; }
        public ImageWriteModel? Image { get; set; }
        public string? Description { get; set; }
    }
}
