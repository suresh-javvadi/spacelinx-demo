namespace SpaceLinx.Model
{
    public partial class KitWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public Guid PartId { get; set; }
        public Guid? LocationId { get; set; }
        public Guid? MaterialKitId { get; set; }
    }
}
