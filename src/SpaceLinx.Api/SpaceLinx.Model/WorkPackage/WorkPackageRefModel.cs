namespace SpaceLinx.Model
{
    public partial class WorkPackageRefModel : BaseRefModel
    {
        public string Name { get; set; } = null!;
        public string Number { get; set; } = null!;
        public int Quantity { get; set; }
    }
}
