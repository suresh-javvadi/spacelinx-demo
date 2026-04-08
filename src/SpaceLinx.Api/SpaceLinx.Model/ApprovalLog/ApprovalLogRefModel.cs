namespace SpaceLinx.Model;

public partial class ApprovalLogRefModel : BaseRefModel
{
    public string Action { get; set; } = null!;
    public DateTime ActionAt { get; set; }
    public string ActionBy { get; set; } = null!;
}
