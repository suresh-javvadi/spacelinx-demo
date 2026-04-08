namespace SpaceLinx.Model
{
    public partial class AppWriteModel : BaseWriteModel
    {
        public string AppName { get; set; } = null!;
        public string? Description { get; set; }
    }
}