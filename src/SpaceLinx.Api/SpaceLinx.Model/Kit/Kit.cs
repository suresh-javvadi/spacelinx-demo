namespace SpaceLinx.Model;

public partial class Kit : BaseModel
{
    public string Name { get; set; } = null!;
    public string Number { get; set; } = null!;
    public Guid PartId { get; set; }
    public Guid? LocationId { get; set; }
    public Guid? MaterialKitId { get; set; }
    public string Status { get; set; } = null!;
    public virtual ICollection<KitBomComment> KitBomComments { get; set; } = new List<KitBomComment>();
    public virtual ICollection<KitSerial> KitSerials { get; set; } = new List<KitSerial>();
    public virtual Location? Location { get; set; }
    public virtual MaterialKit? MaterialKit { get; set; }
    public virtual Part Part { get; set; } = null!;
    public virtual WorkOrder? WorkOrder { get; set; }
}
