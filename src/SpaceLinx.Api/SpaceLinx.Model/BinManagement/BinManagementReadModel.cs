namespace SpaceLinx.Model
{
    public partial class BinManagementReadModel : BaseReadModel
    {
        public Guid? LocationId { get; set; }
        public string BinCode { get; set; } = null!;
        public string? Aisle { get; set; }
        public string? Rack { get; set; }
        public int? Capacity { get; set; }
        public Guid? UnitOfMeasureId { get; set; }
        public virtual LocationRefModel? Location { get; set; } = null!;
        public virtual UnitOfMeasureRefModel? UnitOfMeasure { get; set; }
    }
}