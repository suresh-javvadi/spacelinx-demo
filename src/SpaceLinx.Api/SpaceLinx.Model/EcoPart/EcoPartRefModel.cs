namespace SpaceLinx.Model;

public partial class EcoPartRefModel : BaseRefModel
{
    public string Status { get; set; } = null!;
    public string PreviousStatus { get; set; } = null!;
    public string? Description { get; set; }
    public string OldVersion { get; set; } = null!;
    public string? NewVersion { get; set; }
    public DateTime? EffectiveDate { get; set; }
}