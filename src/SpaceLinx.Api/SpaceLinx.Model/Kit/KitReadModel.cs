namespace SpaceLinx.Model
{
    public partial class KitReadModel : BaseReadModel
    {
        public string Name { get; set; } = null!;
        public string Number { get; set; } = null!;
        public Guid PartId { get; set; }
        public Guid? LocationId { get; set; }
        public Guid? MaterialKitId { get; set; }
        public string Status { get; set; } = null!;
        public virtual LocationRefModel? Location { get; set; }
        public virtual MaterialKitRefModel? MaterialKit { get; set; }
        public virtual PartRefModel Part { get; set; } = null!;
        public virtual WorkOrderRefModel? WorkOrder { get; set; }
    }
}
