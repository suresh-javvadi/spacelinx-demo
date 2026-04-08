namespace SpaceLinx.Model
{
    public partial class MaterialKitUpdateModel : BaseUpdateModel
    {
        public string Name { get; set; } = null!;
        public int Quantity { get; set; }
    }
}
