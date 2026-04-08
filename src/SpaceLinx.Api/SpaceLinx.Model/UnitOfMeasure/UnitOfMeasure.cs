namespace SpaceLinx.Model;

public partial class UnitOfMeasure : BaseModel
{
    public string Name { get; set; } = null!;
    public virtual ICollection<Part> Parts { get; set; } = new List<Part>();
    public virtual ICollection<BinManagement> BinManagements { get; set; } = new List<BinManagement>();
}
