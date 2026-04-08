namespace SpaceLinx.Model
{
    public partial class WorkOrderRefModel : BaseRefModel
    {
        public string Name { get; set; } = null!;
        public string Number { get; set; } = null!;
        public string Status { get; set; } = null!;
    }
}