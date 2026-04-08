namespace SpaceLinx.Model;

public partial class MaterialKit : BaseModel
{
    public string Name { get; set; } = null!;
    public int Sequence { get; set; }
    public string Number { get; set; } = null!;
    public Guid PartId { get; set; }
    public Guid LocationId { get; set; }
    public Guid? ImageId { get; set; }
    public int Quantity { get; set; }
    public virtual Image? Image { get; set; }
    public virtual ICollection<Kit> Kits { get; set; } = new List<Kit>();
    public virtual Location Location { get; set; } = null!;
    public virtual Part Part { get; set; } = null!;
}
