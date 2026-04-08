namespace SpaceLinx.Model
{
    public partial class ToolReadModel : BaseReadModel
    {
        public string Number { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Guid ToolTypeId { get; set; }
        public virtual ToolTypeRefModel ToolType { get; set; } = null!;
    }
}
