namespace SpaceLinx.Model
{
    public partial class ToolWriteModel : BaseWriteModel
    {
        public string Number { get; set; } = null!;
        public string Name { get; set; } = null!;
        public Guid ToolTypeId { get; set; }
    }
}
