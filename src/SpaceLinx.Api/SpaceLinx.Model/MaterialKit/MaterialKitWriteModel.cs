namespace SpaceLinx.Model
{
    public partial class MaterialKitWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public Guid PartId { get; set; }
        public Guid LocationId { get; set; }
        public int Quantity { get; set; }
    }
}
