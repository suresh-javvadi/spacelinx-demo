namespace SpaceLinx.Model
{
    public partial class GuideWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public Guid? PlatformId { get; set; }
        public Guid PartId { get; set; }
        public Guid GuideTypeId { get; set; }
        public string? Category { get; set; }
    }
}
