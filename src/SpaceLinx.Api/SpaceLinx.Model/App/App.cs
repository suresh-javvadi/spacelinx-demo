namespace SpaceLinx.Model
{
    public partial class App : BaseModel
    {
        public int AppNumber { get; set; }
        public string AppName { get; set; } = null!;
        public string? Description { get; set; }
        public virtual ICollection<Role> Roles { get; set; } = new List<Role>();
    }
}