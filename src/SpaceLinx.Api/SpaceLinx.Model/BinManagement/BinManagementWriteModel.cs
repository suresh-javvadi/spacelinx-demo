namespace SpaceLinx.Model
{
    public partial class BinManagementWriteModel : BaseWriteModel
    {
        public Guid? LocationId { get; set; }
        public string BinCode { get; set; } = null!;
        public string? Aisle { get; set; }
        public string? Rack { get; set; }
        public int? Capacity { get; set; }
        public Guid? UnitOfMeasureId { get; set; }
    }
}