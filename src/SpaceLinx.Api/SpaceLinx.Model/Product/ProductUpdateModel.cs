namespace SpaceLinx.Model
{
    public partial class ProductUpdateModel : BaseUpdateModel
    {
        public string Name { get; set; } = null!;
        public Guid? PlatformId { get; set; }
        public string? Description { get; set; }
    }
}
