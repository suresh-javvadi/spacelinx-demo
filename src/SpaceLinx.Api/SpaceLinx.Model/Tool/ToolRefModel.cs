namespace SpaceLinx.Model
{
    public partial class ToolRefModel : BaseRefModel
    {
        public string Number { get; set; } = null!;
        public string Name { get; set; } = null!;
        public virtual ToolTypeRefModel ToolType { get; set; } = null!;
    }
}
