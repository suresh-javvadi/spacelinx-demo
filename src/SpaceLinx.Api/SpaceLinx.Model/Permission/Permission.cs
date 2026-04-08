namespace SpaceLinx.Model
{
    public partial class Permission: BaseModel
    {
        public string Name { get; set; } = null!;
        public string CategoryName { get; set; } = null!;
    }
}