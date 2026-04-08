namespace SpaceLinx.Model;

public partial class EcoPartWriteModel : BaseWriteModel
{
    public Guid PartId { get; set; }
    public string Status { get; set; } = null!;
    public string? Description { get; set; }
}