namespace SpaceLinx.Model
{
    public partial class EbomUpdateModel : BaseUpdateModel
    {
        public Guid PartId { get; set; }
        public Guid ChildPartId { get; set; }
        public int Quantity { get; set; }
        public Guid? AssemblyLocationId { get; set; }
    }
}
