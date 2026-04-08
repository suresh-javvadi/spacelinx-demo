namespace SpaceLinx.Model
{
    public partial class KitSerialRefModel : BaseRefModel
    {
        public Guid KitId { get; set; }
        public Guid PartId { get; set; }
        public string? Serialno { get; set; }
        public string? Status { get; set; }
    }
}
