namespace SpaceLinx.Model
{
    public partial class PartItemWriteModel : BaseWriteModel
    {
        public string Name { get; set; } = null!;
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public decimal? UnitPrice { get; set; }
        public string? ItemType { get; set; }
        public string? ReferenceNumber { get; set; }
    }
}
