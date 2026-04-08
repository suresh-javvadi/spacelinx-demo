namespace SpaceLinx.Model;

public partial class EcoPartUpdateModel : BaseUpdateModel
{
    public string Status { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime? EffectiveDate { get; set; }
}